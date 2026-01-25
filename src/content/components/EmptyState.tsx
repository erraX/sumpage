import { useState, useEffect, useCallback } from "react";
import type { PromptTemplate } from "../../types";
import { getPromptTemplates, getSelectedPromptId, setSelectedPromptId } from "../../utils/storage";
import {
  EmptyContainer,
  PromptPanel,
  PromptHeader,
  PromptCount,
  PromptTabs,
  PromptTab,
  PromptTabTitle,
  PromptTabBadge,
  PromptEditor,
  PromptEditorHead,
  PromptEditorTitle,
  PromptEditorHint,
  PromptTextarea,
  SummarizeButton,
} from "./styles";

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
      <EmptyContainer>
        <p>Loading...</p>
      </EmptyContainer>
    );
  }

  return (
    <EmptyContainer>
      <PromptPanel>
        <PromptHeader>
          <div>
            <h3>Prompt Studio</h3>
            <p>Pick a template, tweak if needed, then send.</p>
          </div>
          <PromptCount>{templates.length} templates</PromptCount>
        </PromptHeader>

        {templates.length > 0 && (
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
        )}

        <PromptEditor>
          <PromptEditorHead>
            <PromptEditorTitle>Prompt</PromptEditorTitle>
            <PromptEditorHint>Enter to send, Shift+Enter for new line</PromptEditorHint>
          </PromptEditorHead>
          <PromptTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Select a template above to edit..."
            rows={8}
            disabled={loading}
          />
        </PromptEditor>

        <SummarizeButton
          onClick={handleSend}
          disabled={!inputValue.trim() || loading}
        >
          {loading ? "Sending..." : "Send →"}
        </SummarizeButton>
      </PromptPanel>
    </EmptyContainer>
  );
}
