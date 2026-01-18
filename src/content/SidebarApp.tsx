import { useState, useEffect, useCallback, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { AISummary, ChatMessage } from "../types";
import type { LoadingStep } from "./types";
import {
  getDeepSeekConfig,
  initializePromptTemplates,
  getPromptTemplates,
  getSelectedPromptId,
  setSelectedPromptId,
  getPromptTemplate,
} from "../utils/storage";
import { DEFAULT_PROMPT_TEMPLATE } from "../types";
import { SidebarHeader } from "./components/SidebarHeader";
import { SidebarSettings } from "./components/SidebarSettings";
import { LoadingStatus } from "./components/LoadingStatus";
import { ErrorNotice } from "./components/ErrorNotice";
import { ChatView } from "./components/ChatView";
import { SummaryView } from "./components/SummaryView";
import { EmptyState } from "./components/EmptyState";
import { renderInlineMarkdown, renderMarkdown } from "./utils/markdown";
import { parseSummaryFromContent } from "./utils/summaryParser";
import { clearChatHistory, getChatHistory, saveChatHistory } from "./utils/chatHistory";

interface SidebarAppProps {
  onClose: () => void;
  showSettings?: boolean;
}

export function SidebarApp({ onClose, showSettings: initialShowSettings = false }: SidebarAppProps) {
  const [showSettings, setShowSettings] = useState(initialShowSettings);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [selectedPromptId, setSelectedPromptIdState] = useState<string | null>(null);
  const [selectedPromptName, setSelectedPromptName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializePromptTemplates(DEFAULT_PROMPT_TEMPLATE).then(() => {
      checkConfiguration();
      loadChatHistoryIfExists();
      loadSelectedPrompt();
    });
  }, []);

  const loadChatHistoryIfExists = async () => {
    const url = window.location.href;
    const title = document.title || "Untitled";
    const history = await getChatHistory(url);
    if (history && history.length > 0) {
      setCurrentUrl(url);
      setCurrentTitle(title);
      setChatMessages(history);
      setLoadingStep("complete");
      // Parse summary and keyPoints from first assistant message
      const firstMsg = history.find(m => m.role === "assistant");
      if (firstMsg) {
        const { summary, keyPoints } = parseSummaryFromContent(firstMsg.content);
        setAiSummary({ summary, keyPoints });
      }
    }
  };

  const loadSelectedPrompt = async () => {
    const promptId = await getSelectedPromptId();
    if (promptId) {
      setSelectedPromptIdState(promptId);
      const prompt = await getPromptTemplate(promptId);
      if (prompt) {
        setSelectedPromptName(prompt.name);
      }
    } else {
      // Set default prompt
      const templates = await getPromptTemplates();
      const defaultPrompt = templates.find(t => t.isDefault);
      if (defaultPrompt) {
        setSelectedPromptIdState(defaultPrompt.id);
        setSelectedPromptName(defaultPrompt.name);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chatMessages]);

  const checkConfiguration = async (options?: { closeIfConfigured?: boolean }) => {
    const config = await getDeepSeekConfig();
    if (!config) {
      setShowSettings(true);
      return;
    }
    if (options?.closeIfConfigured) {
      setShowSettings(false);
    }
  };

  const extractPageContent = useCallback(async (): Promise<{ title: string; url: string; textContent: string } | null> => {
    const title = document.title || "Untitled";
    const url = window.location.href;
    const textContent = document.body?.innerText || "";
    const cleanedText = textContent.replace(/\s+/g, " ").replace(/[\r\n]+/g, ". ").trim();
    return { title, url, textContent: cleanedText };
  }, []);

  const summarizeWithAI = useCallback(async (promptId?: string) => {
    const content = await extractPageContent();
    if (!content) return;

    setLoading(true);
    setLoadingStep("extracting");
    setError(null);

    // Store URL and title for chat history
    setCurrentUrl(content.url);
    setCurrentTitle(content.title);

    // Check for existing chat history
    const existingHistory = await getChatHistory(content.url);
    if (existingHistory && existingHistory.length > 0) {
      // Load existing chat
      setChatMessages(existingHistory);
      setLoading(false);
      setLoadingStep("complete");
      // Parse summary and keyPoints from first assistant message
      const firstMsg = existingHistory.find(m => m.role === "assistant");
      if (firstMsg) {
        const { summary, keyPoints } = parseSummaryFromContent(firstMsg.content);
        setAiSummary({ summary, keyPoints });
      }
      return;
    }

    try {
      setLoadingStep("connecting");

      if (!chrome.runtime?.id) {
        throw new Error("Extension context invalidated");
      }

      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_WITH_DEEPSEEK",
        payload: {
          title: content.title,
          textContent: content.textContent,
          promptId,
        },
      });

      if (response.success && response.data) {
        setAiSummary(response.data);
        setLoadingStep("complete");
        // Initialize chat with the summary as the first AI message
        const initialMessages: ChatMessage[] = [
          {
            role: "assistant",
            content: response.data.summary,
            timestamp: Date.now(),
          },
        ];
        setChatMessages(initialMessages);
        // Save to storage
        await saveChatHistory(content.url, content.title, initialMessages);
      } else {
        setError(response.error || "Failed to generate summary");
        setLoadingStep("idle");
      }
    } catch (err: any) {
      if (err.message?.includes("Extension context invalidated")) {
        setError("Extension reloaded. Please close and reopen.");
      } else if (err.message?.includes("receivers") || err.message?.includes("no receivers")) {
        setError("Background service worker not responding. Check chrome://extensions/");
      } else {
        setError(err.message || "An error occurred");
      }
      setLoadingStep("idle");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep("idle");
      }, 1000);
    }
  }, [extractPageContent]);

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    if (!currentUrl) {
      setError("No page URL found");
      return;
    }

    const trimmedInput = chatInput.trim();
    const hasPlaceholders = trimmedInput.includes("{title}") || trimmedInput.includes("{content}");

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);
    setError(null);

    try {
      const content = await extractPageContent();
      if (!content) throw new Error("Failed to extract page content");

      // If input contains prompt placeholders, send as promptTemplate
      const response = await chrome.runtime.sendMessage({
        type: hasPlaceholders ? "SUMMARIZE_WITH_DEEPSEEK" : "CHAT_WITH_AI",
        payload: hasPlaceholders
          ? {
              title: content.title,
              textContent: content.textContent,
              promptTemplate: trimmedInput,
            }
          : {
              title: content.title,
              textContent: content.textContent,
              message: trimmedInput,
              history: chatMessages,
              promptId: selectedPromptId || undefined,
            },
      });

      if (response.success && response.data) {
        // For promptTemplate responses, parse the summary
        const initialMessages: ChatMessage[] = [
          {
            role: "assistant",
            content: response.data.summary,
            timestamp: Date.now(),
          },
        ];
        setChatMessages(initialMessages);
        await saveChatHistory(content.url, content.title, initialMessages);
      } else if (response.success && response.message) {
        const messagesWithResponse = [...updatedMessages, response.message!];
        setChatMessages(messagesWithResponse);
        await saveChatHistory(currentUrl, currentTitle, messagesWithResponse);
      } else {
        setError(response.error || "Failed to get response");
        setChatMessages((prev) => prev.slice(0, -1));
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, extractPageContent, currentUrl, currentTitle, selectedPromptId]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const startNewChat = () => {
    setAiSummary(null);
    setChatMessages([]);
    setError(null);
    // Clear chat history for current URL
    if (currentUrl) {
      clearChatHistory(currentUrl);
    }
  };

  const handleSendPrompt = async (promptTemplate: string, promptId: string) => {
    // Save selected prompt
    await setSelectedPromptId(promptId);
    setSelectedPromptIdState(promptId);
    const prompt = await getPromptTemplate(promptId);
    if (prompt) {
      setSelectedPromptName(prompt.name);
    }

    const content = await extractPageContent();
    if (!content) return;

    setLoading(true);
    setLoadingStep("extracting");
    setError(null);

    // Store URL and title for chat history
    setCurrentUrl(content.url);
    setCurrentTitle(content.title);

    try {
      setLoadingStep("connecting");

      if (!chrome.runtime?.id) {
        throw new Error("Extension context invalidated");
      }

      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_WITH_DEEPSEEK",
        payload: {
          title: content.title,
          textContent: content.textContent,
          promptTemplate, // Send the edited template directly
        },
      });

      if (response.success && response.data) {
        setAiSummary(response.data);
        setLoadingStep("complete");
        // Initialize chat with the summary as the first AI message
        const initialMessages: ChatMessage[] = [
          {
            role: "assistant",
            content: response.data.summary,
            timestamp: Date.now(),
          },
        ];
        setChatMessages(initialMessages);
        // Save to storage
        await saveChatHistory(content.url, content.title, initialMessages);
      } else {
        setError(response.error || "Failed to generate summary");
        setLoadingStep("idle");
      }
    } catch (err: any) {
      if (err.message?.includes("Extension context invalidated")) {
        setError("Extension reloaded. Please close and reopen.");
      } else if (err.message?.includes("receivers") || err.message?.includes("no receivers")) {
        setError("Background service worker not responding. Check chrome://extensions/");
      } else {
        setError(err.message || "An error occurred");
      }
      setLoadingStep("idle");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep("idle");
      }, 1000);
    }
  };

  const hasChat = chatMessages.length > 0;

  if (showSettings) {
    return (
      <div className="sumpage-sidebar-host">
        <div className="sumpage-sidebar-panel sumpage-open">
          <SidebarHeader title="Settings" onClose={onClose} />
          <SidebarSettings onComplete={() => checkConfiguration({ closeIfConfigured: true })} onBack={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="sumpage-sidebar-host">
      <div className="sumpage-sidebar-panel sumpage-open">
        <SidebarHeader title="Sumpage" onClose={onClose} showNewChat={hasChat} onNewChat={startNewChat} />
        <div className="sumpage-sidebar-content">
          <div className="sumpage-container">
            {loading && <LoadingStatus step={loadingStep} />}

            {error && <ErrorNotice message={error} onRetry={aiSummary ? sendChatMessage : summarizeWithAI} />}

            {/* Chat Messages */}
            {chatMessages.length > 0 && !loading && (
              <ChatView
                messages={chatMessages}
                loading={chatLoading}
                inputValue={chatInput}
                onInputChange={setChatInput}
                onSend={sendChatMessage}
                onKeyPress={handleKeyPress}
                renderMarkdown={renderMarkdown}
                messagesEndRef={messagesEndRef}
                selectedPromptName={selectedPromptName}
              />
            )}

            {/* Initial Summary View */}
            {aiSummary && chatMessages.length === 0 && !loading && !error && (
              <SummaryView
                summary={aiSummary.summary}
                keyPoints={aiSummary.keyPoints}
                onRegenerate={summarizeWithAI}
                renderMarkdown={renderMarkdown}
                renderInlineMarkdown={renderInlineMarkdown}
              />
            )}

            {/* Empty State */}
            {!aiSummary && chatMessages.length === 0 && !loading && !error && (
              <EmptyState onSendPrompt={handleSendPrompt} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
