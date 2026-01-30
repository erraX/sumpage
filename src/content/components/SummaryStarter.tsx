import { useEffect, useMemo, useState } from 'react';
import { useSummarizer } from '../hooks/useSummarizer';
import { DEFAULT_PROMPT_TEMPLATE } from '../constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
  useUIStore,
  useGlobalUiState,
} from '../stores';

interface SummaryStarterProps {
  onOpenSettings?: () => void;
}

// Simple, focused launcher for a summary session
// - lets user pick provider + prompt and start in one click
export function SummaryStarter({ onOpenSettings }: SummaryStarterProps) {
  const { summarize } = useSummarizer();

  const promptTemplates = usePromptTemplates();
  const providerConfigs = useProviderConfigs();
  const globalSettings = useGlobalSettings();
  const uiState = useUIStore();
  const { showSettingPage } = useGlobalUiState();

  const [selectedProvider, setSelectedProvider] = useState(
    providerConfigs.selectedProvider
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(
    promptTemplates.selectedPromptId
  );
  const [promptText, setPromptText] = useState<string>(
    DEFAULT_PROMPT_TEMPLATE.template
  );

  // Keep local selections in sync with stores after async loads
  useEffect(() => {
    if (
      providerConfigs.selectedProvider &&
      providerConfigs.selectedProvider !== selectedProvider
    ) {
      setSelectedProvider(providerConfigs.selectedProvider);
    }
  }, [providerConfigs.selectedProvider, selectedProvider]);

  useEffect(() => {
    if (
      promptTemplates.selectedPromptId &&
      promptTemplates.selectedPromptId !== selectedPrompt
    ) {
      setSelectedPrompt(promptTemplates.selectedPromptId);
    }
  }, [promptTemplates.selectedPromptId, selectedPrompt]);

  // Keep prompt text in sync with selected template; allow temporary edits after initial load
  useEffect(() => {
    const active = promptTemplates.templates.find(
      (tpl) => tpl.id === selectedPrompt
    );
    if (active) {
      setPromptText(active.template);
    } else {
      setPromptText(DEFAULT_PROMPT_TEMPLATE.template);
    }
  }, [selectedPrompt, promptTemplates.templates]);

  const availableProviders = useMemo(() => {
    return Object.values(providerConfigs.configs ?? {});
  }, [providerConfigs.configs]);

  const isReady = availableProviders.length > 0;

  const handleStart = async () => {
    if (!selectedProvider) return;

    // Persist provider choice
    await globalSettings.update({ providerType: selectedProvider });

    // Persist prompt selection
    await promptTemplates.selectTemplate(selectedPrompt ?? null);

    const chosenTemplateText = selectedPrompt
      ? (promptTemplates.templates.find((tpl) => tpl.id === selectedPrompt)
          ?.template ?? DEFAULT_PROMPT_TEMPLATE.template)
      : DEFAULT_PROMPT_TEMPLATE.template;

    const useOverride =
      promptText.trim().length > 0 && promptText !== chosenTemplateText;

    if (useOverride) {
      await summarize(selectedPrompt ?? undefined, promptText);
    } else {
      await summarize(selectedPrompt ?? undefined);
    }
  };

  const handleOpenSettings = () => {
    onOpenSettings?.();
    showSettingPage();
  };

  return (
    <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
      <div>
        <p style={{ margin: 0, color: '#5d6b68', fontSize: 13 }}>
          Pick a provider and prompt, then start to summarize this page.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#1f2a2a' }}>
          Provider
        </label>
        <select
          value={selectedProvider ?? ''}
          onChange={(e) =>
            setSelectedProvider(e.target.value as typeof selectedProvider)
          }
          style={selectStyle}
        >
          <option value='' disabled>
            {isReady ? 'Select provider' : 'No providers configured'}
          </option>
          {availableProviders.map((cfg) => (
            <option key={cfg.provider} value={cfg.provider}>
              {cfg.provider}
            </option>
          ))}
        </select>
        {!isReady && (
          <button style={linkButtonStyle} onClick={handleOpenSettings}>
            Configure a provider to get started
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#1f2a2a' }}>
          Prompt
        </label>
        <select
          value={selectedPrompt ?? ''}
          onChange={(e) => setSelectedPrompt(e.target.value || null)}
          style={selectStyle}
        >
          <option value=''>Default prompt</option>
          {promptTemplates.templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={20}
          style={textAreaStyle}
        />
        <div style={{ fontSize: 12, color: '#5d6b68', textAlign: 'right' }}>
          {promptText.length} chars
        </div>
      </div>

      <button
        style={primaryButtonStyle(
          isReady && !!selectedProvider && !uiState.isLoading
        )}
        disabled={!isReady || !selectedProvider || uiState.isLoading}
        onClick={handleStart}
      >
        {uiState.isLoading ? 'Starting...' : 'Start summary'}
      </button>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 10,
  border: '1px solid #d7e1dd',
  padding: '0 12px',
  fontSize: 14,
  fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif',
  color: '#1f2a2a',
};

const primaryButtonStyle = (enabled: boolean): React.CSSProperties => ({
  height: 44,
  borderRadius: 10,
  border: 'none',
  background: enabled ? '#2f6f6a' : '#b7c7c2',
  color: '#f9fbfa',
  fontSize: 15,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  transition: 'background 0.2s ease',
});

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#2f6f6a',
  fontSize: 13,
  textAlign: 'left',
  padding: 0,
  cursor: 'pointer',
};

const textAreaStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid #d7e1dd',
  padding: '10px 12px',
  fontSize: 13,
  minHeight: 120,
  fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif',
  color: '#1f2a2a',
  resize: 'vertical',
};
