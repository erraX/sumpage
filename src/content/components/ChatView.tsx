import type { KeyboardEvent, RefObject } from "react";
import type { ChatMessage } from "../../types";

interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  renderMarkdown: (content: string) => string;
  messagesEndRef: RefObject<HTMLDivElement>;
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
}: ChatViewProps) {
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
