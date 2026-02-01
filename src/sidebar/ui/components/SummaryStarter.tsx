import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSummarizer } from '../hooks/useSummarizer';
import { DEFAULT_PROMPT_TEMPLATE } from '../constants';
import {
  usePromptTemplates,
  useProviderConfigs,
  useGlobalSettings,
  useUIStore,
  useGlobalUiState,
} from '../stores';
import type { ProviderType } from '../models';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface SummaryStarterProps {
  onOpenSettings?: () => void;
}

// SummaryStarter now uses Material UI primitives for consistent styling inside the sidebar
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
    // Only hydrate from store when local state is empty to avoid overwriting user changes
    if (!selectedProvider && providerConfigs.selectedProvider) {
      setSelectedProvider(providerConfigs.selectedProvider);
    }
  }, [providerConfigs.selectedProvider, selectedProvider]);

  // Sync prompt selection from store
  useEffect(() => {
    if (!selectedPrompt && promptTemplates.selectedPromptId) {
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

  const handleProviderChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as ProviderType | '';
    setSelectedProvider(value || null);
  };

  const handlePromptChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedPrompt(value === 'default' ? null : value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a summary</CardTitle>
        <Typography variant="body2" color="text.secondary" margin={0}>
          Choose provider and prompt, tweak the text for this session, then go.
        </Typography>
      </CardHeader>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Label>Provider</Label>
            <FormControl fullWidth size="small">
              <InputLabel id="provider-select-label">
                {isReady ? 'Select provider' : 'No providers configured'}
              </InputLabel>
              <Select
                labelId="provider-select-label"
                value={selectedProvider ?? ''}
                label={isReady ? 'Select provider' : 'No providers configured'}
                onChange={handleProviderChange}
                native
                displayEmpty
              >
                <option aria-label="None" value="" disabled={!isReady}>
                  {isReady ? 'Select provider' : 'No providers configured'}
                </option>
                {availableProviders.map((cfg) => (
                  <option key={cfg.provider} value={cfg.provider}>
                    {cfg.provider}
                  </option>
                ))}
              </Select>
            </FormControl>
            {!isReady && (
              <Button variant='link' onClick={handleOpenSettings}>
                Configure a provider to get started
              </Button>
            )}
          </Stack>

          <Stack spacing={1}>
            <Label>Prompt</Label>
            <FormControl fullWidth size="small">
              <InputLabel id="prompt-select-label">Prompt</InputLabel>
              <Select
                labelId="prompt-select-label"
                value={selectedPrompt ?? 'default'}
                label="Prompt"
                onChange={handlePromptChange}
                native
              >
                <option value='default'>Default prompt</option>
                {promptTemplates.templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <TextField
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder='Edit the prompt for this session...'
              multiline
              minRows={5}
              size="small"
            />
            <Box display="flex" justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary">
                {promptText.length} chars
              </Typography>
            </Box>
          </Stack>

          <Button
            variant='default'
            size='lg'
            disabled={!canStart}
            onClick={handleStart}
          >
            {uiState.isLoading ? 'Starting...' : 'Start summary'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
