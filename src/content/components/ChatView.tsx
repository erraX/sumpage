import { useState, useEffect, useCallback } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { ChatMessage, PromptTemplate } from "../../types";
import { getPromptTemplates, getSelectedPromptId, setSelectedPromptId } from "../../utils/storage";

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

  if (isLoading) {
    return (
      <div className="sumpage-chat-container">
        <div className="sumpage-chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`sumpage-chat-message sumpage-chat-${msg.role}`}>
              <div className="sumpage-chat-role">{msg.role === "user" ? "You" : "AI"}</div>
              <div
                className="sumpage-chat-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            </div>
          ))}
          {loading && (
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
      </div>
    );
  }

  return (
    <div className="sumpage-chat-container">
      <div className="sumpage-chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`sumpage-chat-message sumpage-chat-${msg.role}`}>
            <div className="sumpage-chat-role">{msg.role === "user" ? "You" : "AI"}</div>
            <div
              className="sumpage-chat-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          </div>
        ))}
        {loading && (
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

      {/* Prompt Selector for Follow-ups */}
      {templates.length > 0 && (
        <div className="sumpage-chat-prompt">
          <div className="sumpage-chat-prompt-head">
            <span className="sumpage-chat-prompt-label">Prompt</span>
            {activePromptName && (
              <span className="sumpage-chat-prompt-name">{activePromptName}</span>
            )}
          </div>
          <div className="sumpage-prompt-tabs" role="tablist" aria-label="Prompt templates">
            {templates.map((t) => {
              const isActive = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`sumpage-prompt-tab ${isActive ? "is-active" : ""}`}
                  onClick={() => handleSelect(t.id)}
                  disabled={loading}
                  aria-pressed={isActive}
                >
                  <span className="sumpage-prompt-tab-title">{t.name}</span>
                  {t.isDefault && <span className="sumpage-prompt-tab-badge">Default</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="sumpage-chat-input-container">
        <textarea
          className="sumpage-chat-input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Ask a follow-up question..."
          rows={1}
          disabled={loading}
        />
        <button
          className="sumpage-chat-send-btn"
          onClick={onSend}
          disabled={!inputValue.trim() || loading}
        >
          →
        </button>
      </div>
    </div>
  );
}
