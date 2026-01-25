import { useState, useEffect, useCallback, memo } from 'react';
import type { PromptTemplate } from '../../types';
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
} from './styles';

interface EmptyStateProps {
  onSendPrompt: (promptTemplate: string, promptId: string) => void;
  loading?: boolean;
  templates: PromptTemplate[];
  onSelectTemplate: (id: string) => Promise<void>;
  selectedTemplateId: string | null;
  onInputChange?: (value: string) => void;
  inputValue?: string;
}

export const EmptyState = memo(function EmptyState({
  onSendPrompt,
  loading,
  templates,
  onSelectTemplate,
  selectedTemplateId,
  inputValue: initialValue = '',
  onInputChange,
}: EmptyStateProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);

  // Sync internal state with prop
  useEffect(() => {
    if (initialValue !== inputValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Load template content when selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const prompt = templates.find((t) => t.id === selectedTemplateId);
      if (prompt && prompt.template !== inputValue) {
        setInputValue(prompt.template);
      }
    }
  }, [selectedTemplateId, templates]);

  const handleSelect = useCallback(
    async (id: string) => {
      console.log('select tempalte, id:', id);
      await onSelectTemplate(id);
    },
    [onSelectTemplate]
  );

  const handleSend = useCallback(() => {
    if (inputValue.trim() && selectedTemplateId) {
      onSendPrompt(inputValue, selectedTemplateId);
    }
  }, [inputValue, selectedTemplateId, onSendPrompt]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onInputChange?.(value);
    },
    [onInputChange]
  );

  if (templates.length === 0) {
    return (
      <EmptyContainer>
        <p>No templates available.</p>
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

        <PromptTabs role='tablist' aria-label='Prompt templates'>
          {templates.map((t) => {
            const isActive = selectedTemplateId === t.id;
            return (
              <PromptTab
                key={t.id}
                type='button'
                $active={isActive}
                onClick={() => handleSelect(t.id)}
                disabled={loading}
                aria-pressed={isActive}
                data-active={!isActive ? 'false' : 'true'}
              >
                <PromptTabTitle>{t.name}</PromptTabTitle>
                {t.isDefault && <PromptTabBadge>Default</PromptTabBadge>}
              </PromptTab>
            );
          })}
        </PromptTabs>

        <PromptEditor>
          <PromptEditorHead>
            <PromptEditorTitle>Prompt</PromptEditorTitle>
            <PromptEditorHint>Enter to send, Shift+Enter for new line</PromptEditorHint>
          </PromptEditorHead>
          <PromptTextarea
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder='Select a template above to edit...'
            rows={8}
            disabled={loading}
          />
        </PromptEditor>

        <SummarizeButton
          onClick={handleSend}
          disabled={!inputValue.trim() || !selectedTemplateId || loading}
        >
          {loading ? 'Sending...' : 'Send →'}
        </SummarizeButton>
      </PromptPanel>
    </EmptyContainer>
  );
});
