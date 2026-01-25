import { useState, useEffect, useCallback } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { ChatMessage, PromptTemplate } from "../../types";
import { getPromptTemplates, getSelectedPromptId, setSelectedPromptId } from "../../utils/storage";
import {
  ChatContainer,
  ChatMessages,
  ChatMessageStyled,
  ChatRole,
  ChatContent,
  ChatTyping,
  ChatTypingDot,
  ChatPrompt,
  ChatPromptHead,
  ChatPromptLabel,
  ChatPromptName,
  ChatInputContainer,
  ChatInput,
  ChatSendButton,
  PromptTabs,
  PromptTab,
  PromptTabTitle,
  PromptTabBadge,
} from "./styles";

interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  renderMarkdown: (content: string) => string;
  messagesEndRef: RefObject<HTMLDivElement>;
  selectedPromptName?: string;
  onPromptSelect?: (promptId: string) => void;
}

export function ChatView({
  messages,
  loading,
  inputValue,
  onInputChange,
  onSend,
  onKeyPress,
  renderMarkdown,
  messagesEndRef,
  selectedPromptName,
  onPromptSelect,
}: ChatViewProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const activePromptName = templates.find((t) => t.id === selectedId)?.name || selectedPromptName || "";

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const [prompts, selected] = await Promise.all([
      getPromptTemplates(),
      getSelectedPromptId(),
    ]);
    setTemplates(prompts);
    const defaultPrompt = prompts.find((p) => p.isDefault);
    setSelectedId(selected || defaultPrompt?.id || prompts[0]?.id || "");
    setIsLoading(false);
  };

  const handleSelect = useCallback(
    async (id: string) => {
      await setSelectedPromptId(id);
      setSelectedId(id);
      const prompt = templates.find((t) => t.id === id);
      if (prompt) {
        onInputChange(prompt.template);
        onPromptSelect?.(id);
      }
    },
    [templates, onInputChange, onPromptSelect]
  );

  const renderMessage = (msg: ChatMessage, index: number) => (
    <ChatMessageStyled key={index} $role={msg.role}>
      <ChatRole $role={msg.role}>{msg.role === "user" ? "You" : "AI"}</ChatRole>
      <ChatContent
        className="chat-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
      />
    </ChatMessageStyled>
  );

  if (isLoading) {
    return (
      <ChatContainer>
        <ChatMessages>
          {messages.map(renderMessage)}
          {loading && (
            <ChatMessageStyled $role="assistant">
              <ChatRole $role="assistant">AI</ChatRole>
              <ChatContent>
                <ChatTyping>
                  <ChatTypingDot $index={0} />
                  <ChatTypingDot $index={1} />
                  <ChatTypingDot $index={2} />
                </ChatTyping>
              </ChatContent>
            </ChatMessageStyled>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatMessages>
        {messages.map(renderMessage)}
        {loading && (
          <ChatMessageStyled $role="assistant">
            <ChatRole $role="assistant">AI</ChatRole>
            <ChatContent>
              <ChatTyping>
                <ChatTypingDot $index={0} />
                <ChatTypingDot $index={1} />
                <ChatTypingDot $index={2} />
              </ChatTyping>
            </ChatContent>
          </ChatMessageStyled>
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>

      {/* Prompt Selector for Follow-ups */}
      {templates.length > 0 && (
        <ChatPrompt>
          <ChatPromptHead>
            <ChatPromptLabel>Prompt</ChatPromptLabel>
            {activePromptName && (
              <ChatPromptName>{activePromptName}</ChatPromptName>
            )}
          </ChatPromptHead>
          <PromptTabs role="tablist" aria-label="Prompt templates">
            {templates.map((t) => {
              const isActive = selectedId === t.id;
              return (
                <PromptTab
                  key={t.id}
                  type="button"
                  $active={isActive}
                  onClick={() => handleSelect(t.id)}
                  disabled={loading}
                  aria-pressed={isActive}
                  data-active={!isActive ? "false" : "true"}
                >
                  <PromptTabTitle>{t.name}</PromptTabTitle>
                  {t.isDefault && <PromptTabBadge>Default</PromptTabBadge>}
                </PromptTab>
              );
            })}
          </PromptTabs>
        </ChatPrompt>
      )}

      <ChatInputContainer>
        <ChatInput
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Ask a follow-up question..."
          rows={1}
          disabled={loading}
        />
        <ChatSendButton
          onClick={onSend}
          disabled={!inputValue.trim() || loading}
        >
          →
        </ChatSendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}
