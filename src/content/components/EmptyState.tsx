import { useState, useEffect, useCallback } from "react";
import type { PromptTemplate } from "../../types";
import { getPromptTemplates, getSelectedPromptId, setSelectedPromptId } from "../../utils/storage";

interface EmptyStateProps {
  onSendPrompt: (promptTemplate: string, promptId: string) => void;
  loading?: boolean;
}

export function EmptyState({ onSendPrompt, loading }: EmptyStateProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

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
    const initialId = selected || defaultPrompt?.id || prompts[0]?.id;
    if (initialId) {
      setSelectedId(initialId);
      const prompt = prompts.find((p) => p.id === initialId);
      if (prompt) {
        setInputValue(prompt.template);
      }
    }
    setIsLoading(false);
  };

  const handleSelect = useCallback(async (id: string) => {
    await setSelectedPromptId(id);
    setSelectedId(id);
    const prompt = templates.find((t) => t.id === id);
    if (prompt) {
      setInputValue(prompt.template);
    }
  }, [templates]);

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      onSendPrompt(inputValue, selectedId);
    }
  }, [inputValue, selectedId, onSendPrompt]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (isLoading) {
    return (
      <div className="sumpage-empty">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="sumpage-empty">
      <div className="sumpage-prompt-panel">
        <div className="sumpage-prompt-header">
          <div>
            <h3>Prompt Studio</h3>
            <p>Pick a template, tweak if needed, then send.</p>
          </div>
          <div className="sumpage-prompt-count">{templates.length} templates</div>
        </div>

        {templates.length > 0 && (
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
        )}

        <div className="sumpage-prompt-editor">
          <div className="sumpage-prompt-editor-head">
            <span className="sumpage-prompt-editor-title">Prompt</span>
            <span className="sumpage-prompt-editor-hint">Enter to send, Shift+Enter for new line</span>
          </div>
          <textarea
            className="sumpage-prompt-textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Select a template above to edit..."
            rows={8}
            disabled={loading}
          />
        </div>

        <button
          className="sumpage-summarize-btn sumpage-prompt-send"
          onClick={handleSend}
          disabled={!inputValue.trim() || loading}
        >
          {loading ? "Sending..." : "Send →"}
        </button>
      </div>
    </div>
  );
}
