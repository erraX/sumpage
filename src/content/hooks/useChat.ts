import { useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "../../types";
import { useChatStore } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore";
import { saveChatHistory } from "../store/chatStorage";

interface UseChatReturn {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  sendMessage: () => Promise<void>;
  clearChat: () => void;
  setInputValue: (value: string) => void;
  loadChatHistory: (url: string) => void;
  hasChat: boolean;
}

export function useChat(): UseChatReturn {
  const {
    messages,
    inputValue,
    isLoading: chatLoading,
    addMessage,
    clearChat: clearChatStore,
    setInputValue,
    loadChatHistory: loadFromStore,
  } = useChatStore();

  const { setIsLoading, setLoadingStep, setError } = useUIStore();

  const currentUrlRef = useRef<string>("");
  const currentTitleRef = useRef<string>("");

  // Load chat history from storage
  const loadChatHistory = useCallback(
    (url: string) => {
      currentUrlRef.current = url;
      loadFromStore(url);
    },
    [loadFromStore]
  );

  const clearChat = useCallback(() => {
    clearChatStore();
    currentUrlRef.current = "";
    currentTitleRef.current = "";
  }, [clearChatStore]);

  const sendMessage = useCallback(
    async () => {
      const message = inputValue.trim();
      if (!message || chatLoading) return;
      if (!currentUrlRef.current) {
        setError("No page URL found");
        return;
      }

      const trimmedInput = message;
      const hasPlaceholders =
        trimmedInput.includes("{title}") || trimmedInput.includes("{content}");

      const userMessage: ChatMessage = {
        role: "user",
        content: trimmedInput,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      setInputValue("");
      setIsLoading(true);
      setLoadingStep("connecting");
      setError(null);

      try {
        // Get page content
        const title = document.title || "Untitled";
        const textContent = document.body?.innerText || "";
        const cleanedText = textContent
          .replace(/\s+/g, " ")
          .replace(/[\r\n]+/g, ". ")
          .trim();

        // Send message to background script
        const response = await chrome.runtime.sendMessage({
          type: hasPlaceholders ? "SUMMARIZE_WITH_DEEPSEEK" : "CHAT_WITH_AI",
          payload: hasPlaceholders
            ? {
                title,
                textContent: cleanedText,
                promptTemplate: trimmedInput,
              }
            : {
                title,
                textContent: cleanedText,
                message: trimmedInput,
                history: messages,
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
          useChatStore.getState().setMessages(initialMessages);
          await saveChatHistory(
            currentUrlRef.current,
            currentTitleRef.current,
            initialMessages
          );
        } else if (response.success && response.message) {
          const messagesWithResponse = [...messages, userMessage, response.message];
          useChatStore.getState().setMessages(messagesWithResponse);
          await saveChatHistory(
            currentUrlRef.current,
            currentTitleRef.current,
            messagesWithResponse
          );
        } else {
          setError(response.error || "Failed to get response");
          // Remove user message on error
          useChatStore.getState().setMessages(messages);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        // Remove user message on error
        useChatStore.getState().setMessages(messages);
      } finally {
        setIsLoading(false);
        setLoadingStep("idle");
      }
    },
    [inputValue, messages, chatLoading, addMessage, setInputValue, setIsLoading, setLoadingStep, setError]
  );

  const hasChat = messages.length > 0;

  return {
    messages,
    inputValue,
    isLoading: chatLoading,
    sendMessage,
    clearChat,
    setInputValue,
    loadChatHistory,
    hasChat,
  };
}

/**
 * Hook for auto-scrolling to bottom of chat
 */
export function useChatScroll(messages: ChatMessage[], messagesEndRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);
}
