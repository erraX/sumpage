import { useEffect, useState } from 'react';
import type { ProviderConfig, ProviderType } from '../../models';
import * as storage from '../../storages/providerConfigStorage';
import { useGlobalSettings } from '../../stores';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
} from '../ui';
import * as S from './styles';
import { FormControl, InputLabel, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { PROVIDERS, PROVIDER_DEFAULTS } from './constants';

interface ProviderConfigProps {
  onComplete?: () => void;
}

export function ProviderConfig({ onComplete }: ProviderConfigProps) {
  const globalSettings = useGlobalSettings();

  const [existingConfig, setExistingConfig] = useState<ProviderConfig | null>(
    null
  );

  const [formData, setFormData] = useState({
    baseUrl: '',
    apiKey: '',
    model: '',
    maxTokens: '4000',
    temperature: '0.7',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeProviderType = globalSettings.settings.providerType;
  const [selectedProviderType, setSelectedProviderType] =
    useState<ProviderType | null>(activeProviderType);

  // Load config when provider changes
  useEffect(() => {
    const loadConfig = async () => {
      if (!selectedProviderType) return;

      const config = await storage.getConfig(selectedProviderType);
      setExistingConfig(config);

      if (config) {
        setFormData({
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model: config.model,
          maxTokens: String(config.maxTokens),
          temperature: String(config.temperature),
        });
      } else {
        // Set defaults for new provider
        const defaults = PROVIDER_DEFAULTS[selectedProviderType];
        setFormData({
          baseUrl: defaults.baseUrl,
          apiKey: '',
          model: defaults.model,
          maxTokens: '4000',
          temperature: '0.7',
        });
      }
    };

    loadConfig();
  }, [selectedProviderType]);

  const handleProviderSelect = (event: SelectChangeEvent<string>) => {
    const provider = event.target.value as ProviderType;
    setSelectedProviderType(provider);
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): string | null => {
    if (!formData.baseUrl.trim()) {
      return 'Please enter API Base URL';
    }
    if (!formData.apiKey.trim()) {
      return 'Please enter API Key';
    }
    try {
      new URL(formData.baseUrl);
    } catch {
      return 'Please enter a valid API Base URL';
    }
    const maxTokens = parseInt(formData.maxTokens, 10);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 32000) {
      return 'maxTokens must be between 1 and 32000';
    }
    const temp = parseFloat(formData.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      return 'temperature must be between 0 and 2';
    }
    return null;
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedProviderType) return;

    setIsLoading(true);
    try {
      const hadExistingConfig = Boolean(existingConfig);
      await storage.saveConfig(selectedProviderType, {
        baseUrl: formData.baseUrl.trim(),
        apiKey: formData.apiKey.trim(),
        model: formData.model.trim(),
        maxTokens: parseInt(formData.maxTokens, 10),
        temperature: parseFloat(formData.temperature),
      });
      setSuccessMessage(
        hadExistingConfig ? 'Configuration updated!' : 'Configuration saved!'
      );
      setExistingConfig(await storage.getConfig(selectedProviderType));
      setTimeout(() => {
        setSuccessMessage(null);
        onComplete?.();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save configuration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!selectedProviderType) return;

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await storage.deleteConfig(selectedProviderType);
      setExistingConfig(null);
      const defaults = PROVIDER_DEFAULTS[selectedProviderType];
      setFormData({
        baseUrl: defaults.baseUrl,
        apiKey: '',
        model: defaults.model,
        maxTokens: '4000',
        temperature: '0.7',
      });
      setSuccessMessage('Configuration reset to defaults');
      setTimeout(() => setSuccessMessage(null), 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear configuration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <S.ProviderContainer>
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Provider Selector */}
          <S.ProviderTabsContainer>
            <FormControl fullWidth size='small'>
              <InputLabel id='provider-select'>Choose provider</InputLabel>
              <Select
                native
                labelId='provider-select'
                label='Choose provider'
                value={selectedProviderType ?? ''}
                onChange={handleProviderSelect}
                inputProps={{ 'data-testid': 'provider-select-native' }}
              >
                <option aria-label='None' value='' disabled>
                  Select a provider
                </option>
                {PROVIDERS.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </S.ProviderTabsContainer>

          {selectedProviderType ? (
            <>
              {/* Base URL */}
              <S.ProviderFormGroup>
                <Label>API Base URL</Label>
                <Input
                  type='url'
                  value={formData.baseUrl}
                  onChange={handleInputChange('baseUrl')}
                  placeholder='https://api.example.com/v1'
                  disabled={isLoading}
                />
              </S.ProviderFormGroup>

              {/* API Key */}
              <S.ProviderFormGroup>
                <Label>API Key</Label>
                <Input
                  type='password'
                  value={formData.apiKey}
                  onChange={handleInputChange('apiKey')}
                  placeholder='sk-...'
                  disabled={isLoading}
                />
              </S.ProviderFormGroup>

              {/* Model */}
              <S.ProviderFormGroup>
                <Label>Model</Label>
                <Input
                  type='text'
                  value={formData.model}
                  onChange={handleInputChange('model')}
                  placeholder='Model name'
                  disabled={isLoading}
                />
              </S.ProviderFormGroup>

              {/* Advanced Toggle */}
              <S.AdvancedToggle
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </S.AdvancedToggle>

              {/* Advanced Settings */}
              {showAdvanced && (
                <S.AdvancedSettings>
                  <S.GridRow>
                    <S.ProviderFormGroup>
                      <Label>Max Tokens</Label>
                      <Input
                        type='text'
                        value={formData.maxTokens}
                        onChange={handleInputChange('maxTokens')}
                        disabled={isLoading}
                      />
                    </S.ProviderFormGroup>
                    <S.ProviderFormGroup>
                      <Label>Temperature</Label>
                      <Input
                        type='text'
                        value={formData.temperature}
                        onChange={handleInputChange('temperature')}
                        disabled={isLoading}
                      />
                    </S.ProviderFormGroup>
                  </S.GridRow>
                </S.AdvancedSettings>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {successMessage && (
                <Alert variant='success'>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <S.ButtonRow>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  variant='default'
                  size='default'
                >
                  {isLoading ? 'Saving...' : existingConfig ? 'Update' : 'Save'}
                </Button>
                {selectedProviderType && (
                  <Button
                    onClick={handleClear}
                    disabled={isLoading}
                    variant='outline'
                    size='default'
                  >
                    Clear
                  </Button>
                )}
              </S.ButtonRow>
            </>
          ) : (
            <S.EmptyState>Select a provider to configure</S.EmptyState>
          )}
        </CardContent>
      </Card>
    </S.ProviderContainer>
  );
}
