import { useState, useEffect, useCallback, useRef } from "react";
import { marked } from "marked";
import type { AISummary, ChatMessage } from "../types";

interface SidebarAppProps {
  onClose: () => void;
  showSettings?: boolean;
}

type LoadingStep = "idle" | "extracting" | "connecting" | "complete";

marked.setOptions({
  gfm: true,
  breaks: true,
});

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkConfiguration();
    loadChatHistoryIfExists();
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

  const summarizeWithAI = useCallback(async () => {
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
        payload: { title: content.title, textContent: content.textContent },
      });

      if (response.success && response.data) {
        setAiSummary(response.data);
        setLoadingStep("complete");
        // Initialize chat with the summary as the first AI message
        const initialMessages: ChatMessage[] = [
          {
            role: "assistant",
            content: response.data.summary + "\n\n**Key Points:**\n" + response.data.keyPoints.map((p: string) => "- " + p).join("\n"),
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

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
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

      const response = await chrome.runtime.sendMessage({
        type: "CHAT_WITH_AI",
        payload: {
          title: content.title,
          textContent: content.textContent,
          message: userMessage.content,
          history: chatMessages,
        },
      });

      if (response.success && response.message) {
        const messagesWithResponse = [...updatedMessages, response.message!];
        setChatMessages(messagesWithResponse);
        // Save to storage
        await saveChatHistory(currentUrl, currentTitle, messagesWithResponse);
      } else {
        setError(response.error || "Failed to get response");
        // Remove user message on error
        setChatMessages((prev) => prev.slice(0, -1));
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      // Remove user message on error
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, extractPageContent, currentUrl, currentTitle]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  const hasChat = chatMessages.length > 0;

  const sanitizeHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const allowedTags = new Set([
      "p",
      "br",
      "strong",
      "em",
      "code",
      "pre",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "a",
      "span",
    ]);
    const allowedAttrs = new Set(["href", "target", "rel"]);

    const elements = Array.from(doc.body.querySelectorAll("*"));
    for (const el of elements) {
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        }
        continue;
      }

      for (const attr of Array.from(el.attributes)) {
        if (!allowedAttrs.has(attr.name)) {
          el.removeAttribute(attr.name);
        }
      }

      if (tag === "a") {
        const href = el.getAttribute("href") || "";
        let isSafe = false;
        try {
          const url = new URL(href, window.location.href);
          isSafe = url.protocol === "http:" || url.protocol === "https:";
        } catch {
          isSafe = false;
        }
        if (!isSafe) {
          el.removeAttribute("href");
        } else {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
      }
    }

    return doc.body.innerHTML;
  };

  const renderMarkdown = (content: string) =>
    sanitizeHtml(marked.parse(content, { async: false }) as string);
  const renderInlineMarkdown = (content: string) =>
    sanitizeHtml(marked.parseInline(content, { async: false }) as string);

  // Parse summary and keyPoints from chat message content
  const parseSummaryFromContent = (content: string): { summary: string; keyPoints: string[] } => {
    const keyPointsHeading = /^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:关键要点|关键点|Key Points?)\s*(?:\*\*)?\s*:?\s*$/im;
    const keyPointsMatch = content.match(keyPointsHeading);

    if (keyPointsMatch && typeof keyPointsMatch.index === "number") {
      const summaryPart = content.substring(0, keyPointsMatch.index).trim();
      const afterHeading = content.slice(keyPointsMatch.index + keyPointsMatch[0].length);
      const keyPointsText = afterHeading.replace(/^[\r\n\s]+/, "");

      const keyPoints = keyPointsText
        .split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter((line) => line.length > 0 && line.length < 200)
        .slice(0, 10);

      return { summary: summaryPart, keyPoints };
    }

    // No key points section found, return entire content as summary
    return { summary: content, keyPoints: [] };
  };

  if (showSettings) {
    return (
      <div className="sumpage-sidebar-host">
        <div className="sumpage-sidebar-panel sumpage-open">
          <div className="sumpage-sidebar-header">
            <h2 className="sumpage-sidebar-title">Settings</h2>
            <button className="sumpage-close-btn" onClick={onClose}>
              <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
            </button>
          </div>
          <SidebarSettings onComplete={() => checkConfiguration({ closeIfConfigured: true })} onBack={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="sumpage-sidebar-host">
      <div className="sumpage-sidebar-panel sumpage-open">
        <div className="sumpage-sidebar-header">
          <h2 className="sumpage-sidebar-title">Sumpage</h2>
          {hasChat && (
            <button className="sumpage-new-chat-btn" onClick={startNewChat} title="New Chat">
              +
            </button>
          )}
          <button className="sumpage-close-btn" onClick={onClose}>
            <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
          </button>
        </div>
        <div className="sumpage-sidebar-content">
          <div className="sumpage-container">
            {loading && (
              <div className={`sumpage-loading ${loadingStep === "complete" ? "success" : ""}`}>
                <div className="sumpage-loading-icon">
                  <div className="sumpage-spinner" />
                </div>
                <p>
                  {loadingStep === "extracting" && "Extracting page content..."}
                  {loadingStep === "connecting" && "Connecting to DeepSeek API..."}
                  {loadingStep === "complete" && "Summary generated!"}
                </p>
              </div>
            )}

            {error && (
              <div className="sumpage-error">
                <p>{error}</p>
                <button className="sumpage-retry-btn" onClick={aiSummary ? sendChatMessage : summarizeWithAI}>
                  {aiSummary ? "Retry" : "Retry"}
                </button>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.length > 0 && !loading && (
              <div className="sumpage-chat-container">
                <div className="sumpage-chat-messages">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`sumpage-chat-message sumpage-chat-${msg.role}`}
                    >
                      <div className="sumpage-chat-role">
                        {msg.role === "user" ? "You" : "AI"}
                      </div>
                      <div
                        className="sumpage-chat-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="sumpage-chat-message sumpage-chat-assistant">
                      <div className="sumpage-chat-role">AI</div>
                      <div className="sumpage-chat-content sumpage-typing">
                        <span className="sumpage-typing-dot"></span>
                        <span className="sumpage-typing-dot"></span>
                        <span className="sumpage-typing-dot"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="sumpage-chat-input-container">
                  <textarea
                    className="sumpage-chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a follow-up question..."
                    rows={1}
                    disabled={chatLoading}
                  />
                  <button
                    className="sumpage-chat-send-btn"
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || chatLoading}
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {/* Initial Summary View */}
            {aiSummary && chatMessages.length === 0 && !loading && !error && (
              <div className="sumpage-result">
                <div className="sumpage-ai-badge">AI Generated</div>
                <div
                  className="sumpage-markdown-section sumpage-markdown-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(aiSummary.summary) }}
                />
                {aiSummary.keyPoints.length > 0 && (
                  <div className="sumpage-markdown-section">
                    <h3>Key Points</h3>
                    <ul className="sumpage-key-points">
                      {aiSummary.keyPoints.map((point, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(point) }} />
                      ))}
                    </ul>
                  </div>
                )}
                <div className="sumpage-actions">
                  <button className="sumpage-refresh-btn" onClick={summarizeWithAI}>
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!aiSummary && chatMessages.length === 0 && !loading && !error && (
              <div className="sumpage-empty">
                <p>Click the button below to summarize this page with AI</p>
                <button className="sumpage-summarize-btn" onClick={summarizeWithAI}>
                  Summarize Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Settings component for sidebar
function SidebarSettings({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);
  const [maxTokens, setMaxTokens] = useState("4000");
  const [temperature, setTemperature] = useState("0.7");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDeepSeekConfig().then((config) => {
      if (config) {
        setBaseUrl(config.baseUrl);
        setApiKey(config.apiKey);
        if (config.promptTemplate) setPromptTemplate(config.promptTemplate);
        if (config.maxTokens) setMaxTokens(String(config.maxTokens));
        if (config.temperature) setTemperature(String(config.temperature));
      }
    });
  }, []);

  const handleSave = async () => {
    if (!baseUrl.trim()) { setError("Please enter API Base URL"); return; }
    if (!apiKey.trim()) { setError("Please enter API Key"); return; }
    try { new URL(baseUrl); } catch { setError("Please enter a valid API Base URL"); return; }
    const maxTokensNum = parseInt(maxTokens, 10);
    if (isNaN(maxTokensNum) || maxTokensNum < 1 || maxTokensNum > 32000) {
      setError("maxTokens must be between 1 and 32000"); return;
    }
    const tempNum = parseFloat(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
      setError("temperature must be between 0 and 2"); return;
    }
    if (!promptTemplate.includes("{title}") || !promptTemplate.includes("{content}")) {
      setError("Prompt template must include {title} and {content} placeholders"); return;
    }

    setSaving(true);
    setError(null);

    try {
      const config = {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: "deepseek-chat",
        maxTokens: maxTokensNum,
        temperature: tempNum,
        promptTemplate: promptTemplate.trim(),
      };
      await saveDeepSeekConfig(config);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onComplete(); }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = () => setPromptTemplate(DEFAULT_PROMPT);

  return (
    <div className="sumpage-sidebar-content">
      <div className="sumpage-container">
        <button className="sumpage-retry-btn" onClick={onBack} style={{ marginBottom: "16px" }}>
          Back
        </button>

        <div className="sumpage-form-group">
          <label className="sumpage-label">API Base URL</label>
          <input
            className="sumpage-input"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com/v1"
            disabled={saving}
          />
        </div>

        <div className="sumpage-form-group">
          <label className="sumpage-label">API Key</label>
          <input
            className="sumpage-input"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={saving}
          />
        </div>

        <button
          className="sumpage-refresh-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ marginBottom: "16px" }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {showAdvanced && (
          <div style={{ marginBottom: "16px" }}>
            <div className="sumpage-form-group">
              <label className="sumpage-label">Prompt Template</label>
              <textarea
                className="sumpage-textarea"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                disabled={saving}
                rows={8}
              />
              <p style={{ fontSize: "12px", color: "var(--sumpage-muted)", margin: "8px 0 0 0" }}>
                Placeholders: {"{title}"} - page title, {"{content}"} - page content
              </p>
              <button className="sumpage-retry-btn" onClick={handleResetPrompt} style={{ marginTop: "8px" }}>
                Reset to Default
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="sumpage-form-group">
                <label className="sumpage-label">Max Tokens</label>
                <input
                  className="sumpage-input"
                  type="text"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="sumpage-form-group">
                <label className="sumpage-label">Temperature</label>
                <input
                  className="sumpage-input"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        )}

        {error && <div className="sumpage-error"><p>{error}</p></div>}
        {success && (
          <div
            style={{
              background: "var(--sumpage-success-soft)",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              textAlign: "center",
              color: "var(--sumpage-success)",
              border: "1px solid var(--sumpage-border)",
            }}
          >
            Settings saved!
          </div>
        )}

        <button className="sumpage-summarize-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_PROMPT = `Please summarize the following webpage content:

Title: {title}

Content:
{content}

Please provide:
1. A concise summary (2-3 paragraphs)
2. 3-5 key points as bullet points

Format your response as:
## Summary
[your summary here]

## Key Points
- [key point 1]
- [key point 2]
- [key point 3]`;

// Inline storage functions for sidebar
function isChromeStorageAvailable(): boolean {
  return !!(
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local
  );
}

async function getDeepSeekConfig(): Promise<any | null> {
  if (!isChromeStorageAvailable()) {
    console.log("[Sumpage] Chrome storage not available");
    return null;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get("deepseekConfig", (result) => {
      resolve(result.deepseekConfig || null);
    });
  });
}

async function saveDeepSeekConfig(config: any): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error("Chrome storage is not available");
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ deepseekConfig: config }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// Chat history storage functions
async function getChatHistory(url: string): Promise<ChatMessage[] | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      resolve(history[url]?.messages || null);
    });
  });
}

async function saveChatHistory(url: string, title: string, messages: ChatMessage[]): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error("Chrome storage is not available");
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      history[url] = {
        url,
        title,
        messages,
        lastUpdated: Date.now(),
      };
      chrome.storage.local.set({ chatHistory: history }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

async function clearChatHistory(url: string): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      delete history[url];
      chrome.storage.local.set({ chatHistory: history }, () => {
        resolve();
      });
    });
  });
}
