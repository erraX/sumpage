import { useCallback } from "react";
import type { AISummary, ChatMessage } from "../models";
import { useChatSession } from "../stores/useChatSession";
import { useUIStore } from "../stores/uiStore";
import { getChatHistory, saveChatHistory } from "../storages/chatHistoryStorage";

interface UseSummarizerReturn {
  summarize: (promptId?: string, templateOverride?: string) => Promise<void>;
  summarizeWithTemplate: (template: string) => Promise<void>;
  extractPageContent: () => Promise<{ title: string; url: string; textContent: string } | null>;
  checkConfiguration: (options?: { closeIfConfigured?: boolean }) => Promise<boolean>;
}

export function useSummarizer(): UseSummarizerReturn {
  const { setMessages, loadChatHistory: loadFromStore } = useChatSession();
  const {
    setIsLoading,
    setLoadingStep,
    setError,
  } = useUIStore();

  const extractPageContent = useCallback(async (): Promise<{
    title: string;
    url: string;
    textContent: string;
  } | null> => {
    const title = document.title || "Untitled";
    const url = window.location.href;
    const textContent = document.body?.innerText || "";
    const cleanedText = textContent
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, ". ")
      .trim();
    return { title, url, textContent: cleanedText };
  }, []);

  const handleError = useCallback(
    (err: unknown): string => {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (errorMessage.includes("Extension context invalidated")) {
        return "Extension reloaded. Please close and reopen.";
      }
      if (
        errorMessage.includes("receivers") ||
        errorMessage.includes("no receivers")
      ) {
        return "Background service worker not responding. Check chrome://extensions/";
      }
      return errorMessage;
    },
    []
  );

  const checkConfiguration = useCallback(
    async (_options?: { closeIfConfigured?: boolean }): Promise<boolean> => {
      if (typeof chrome === "undefined" || !chrome.storage) {
        return false;
      }

      return new Promise((resolve) => {
        chrome.storage.local.get("deepseekConfig", (result) => {
          const config = result.deepseekConfig;
          resolve(!!config);
        });
      });
    },
    []
  );

  const summarize = useCallback(
    async (promptId?: string, templateOverride?: string) => {
      const content = await extractPageContent();
      if (!content) return;

      setIsLoading(true);
      setLoadingStep("extracting");
      setError(null);

      try {
        // Check for existing chat history
        const existingHistory = await getChatHistory(content.url);
        if (existingHistory && existingHistory.length > 0) {
          // Load existing chat
          loadFromStore(content.url);
          setIsLoading(false);
          setLoadingStep("complete");
          return;
        }

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
            promptTemplate: templateOverride,
          },
        });

        if (response.success && response.data) {
          // Initialize chat with the summary as the first AI message
          const initialMessages: ChatMessage[] = [
            {
              role: "assistant" as const,
              content: response.data.summary,
              timestamp: Date.now(),
            },
          ];
          setMessages(initialMessages);
          await saveChatHistory(content.url, content.title, initialMessages);
          setLoadingStep("complete");
        } else {
          setError(response.error || "Failed to generate summary");
          setLoadingStep("idle");
        }
      } catch (err) {
        setError(handleError(err));
        setLoadingStep("idle");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep("idle");
        }, 1000);
      }
    },
    [extractPageContent, setIsLoading, setLoadingStep, setError, setMessages, loadFromStore, handleError]
  );

  const summarizeWithTemplate = useCallback(
    async (template: string) => {
      const content = await extractPageContent();
      if (!content) return;

      setIsLoading(true);
      setLoadingStep("extracting");
      setError(null);

      try {
        // Check for existing chat history
        const existingHistory = await getChatHistory(content.url);
        if (existingHistory && existingHistory.length > 0) {
          loadFromStore(content.url);
          setIsLoading(false);
          setLoadingStep("complete");
          return;
        }

        setLoadingStep("connecting");

        if (!chrome.runtime?.id) {
          throw new Error("Extension context invalidated");
        }

        const response = await chrome.runtime.sendMessage({
          type: "SUMMARIZE_WITH_DEEPSEEK",
          payload: {
            title: content.title,
            textContent: content.textContent,
            promptTemplate: template,
          },
        });

        if (response.success && response.data) {
          const initialMessages: ChatMessage[] = [
            {
              role: "assistant" as const,
              content: response.data.summary,
              timestamp: Date.now(),
            },
          ];
          setMessages(initialMessages);
          await saveChatHistory(content.url, content.title, initialMessages);
          setLoadingStep("complete");
        } else {
          setError(response.error || "Failed to generate summary");
          setLoadingStep("idle");
        }
      } catch (err) {
        setError(handleError(err));
        setLoadingStep("idle");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep("idle");
        }, 1000);
      }
    },
    [extractPageContent, setIsLoading, setLoadingStep, setError, setMessages, loadFromStore, handleError]
  );

  return {
    summarize,
    summarizeWithTemplate,
    extractPageContent,
    checkConfiguration,
  };
}

/**
 * Hook for getting the AI summary from chat messages
 */
export function useAISummary(messages: { role: string; content: string }[]): AISummary | null {
  const firstAssistantMessage = messages.find((m) => m.role === "assistant");

  if (!firstAssistantMessage) {
    return null;
  }

  return {
    summary: firstAssistantMessage.content,
    keyPoints: [],
  };
}
