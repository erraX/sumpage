import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useSummarizer } from '../hooks/useSummarizer';
import { DEFAULT_PROMPT_TEMPLATE } from '../constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
  useUIStore,
  useGlobalUiState,
} from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from './ui/select';

interface SummaryStarterProps {
  onOpenSettings?: () => void;
}

// SummaryStarter built with shadcn-style primitives for consistency/testability
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

  // Sync provider selection from store
  useEffect(() => {
    if (
      providerConfigs.selectedProvider &&
      providerConfigs.selectedProvider !== selectedProvider
    ) {
      setSelectedProvider(providerConfigs.selectedProvider);
    }
  }, [providerConfigs.selectedProvider, selectedProvider]);

  // Sync prompt selection from store
  useEffect(() => {
    if (
      promptTemplates.selectedPromptId &&
      promptTemplates.selectedPromptId !== selectedPrompt
    ) {
      setSelectedPrompt(promptTemplates.selectedPromptId);
    }
  }, [promptTemplates.selectedPromptId, selectedPrompt]);

  // Load prompt text for current selection; allow inline edits afterward
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
  const canStart =
    isReady &&
    !!selectedProvider &&
    promptText.trim().length > 0 &&
    !uiState.isLoading;

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
    <Card>
      <CardHeader>
        <CardTitle>Start a summary</CardTitle>
        <HelperText>
          Choose provider and prompt, tweak the text for this session, then go.
        </HelperText>
      </CardHeader>
      <CardContent css={{ display: 'grid', gap: 16 }}>
        <Field>
          <Label>Provider</Label>
          <Select
            value={selectedProvider ?? ''}
            onValueChange={(val) =>
              setSelectedProvider(val as typeof selectedProvider)
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isReady ? 'Select provider' : 'No providers configured'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectViewport>
                {availableProviders.map((cfg) => (
                  <SelectItem key={cfg.provider} value={cfg.provider}>
                    {cfg.provider}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select>
          {!isReady && (
            <Button
              variant='link'
              onClick={handleOpenSettings}
              css={{ padding: 0, width: 'fit-content' }}
            >
              Configure a provider to get started
            </Button>
          )}
        </Field>

        <Field>
          <Label>Prompt</Label>
          <Select
            value={selectedPrompt ?? 'default'}
            onValueChange={(val) =>
              setSelectedPrompt(val === 'default' ? null : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Default prompt' />
            </SelectTrigger>
            <SelectContent>
              <SelectViewport>
                <SelectItem value='default'>Default prompt</SelectItem>
                {promptTemplates.templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select>
          <TextArea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder='Edit the prompt for this session...'
          />
          <CharHint>{promptText.length} chars</CharHint>
        </Field>

        <Button
          variant='default'
          size='lg'
          disabled={!canStart}
          onClick={handleStart}
        >
          {uiState.isLoading ? 'Starting...' : 'Start summary'}
        </Button>
      </CardContent>
    </Card>
  );
}

const Field = styled.div`
  display: grid;
  gap: 8px;
`;

const HelperText = styled.p`
  margin: 0;
  color: #5d6b68;
  font-size: 13px;
`;

const TextArea = styled.textarea`
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  padding: 10px 12px;
  font-size: 13px;
  min-height: 120px;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  color: #1f2a2a;
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  outline: none;

  &:focus {
    border-color: #2f6f6a;
    box-shadow: 0 0 0 3px #e3f0ee;
  }
`;

const CharHint = styled.div`
  font-size: 12px;
  color: #5d6b68;
  text-align: right;
`;
