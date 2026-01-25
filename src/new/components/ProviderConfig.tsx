import { useEffect, useState } from 'react';
import type { ProviderConfig, ProviderType } from '../models';
import * as storage from '../storages/providerConfigStorage';
import * as S from './styles';

const PROVIDERS: { type: ProviderType; label: string }[] = [
  { type: 'deepseek', label: 'DeepSeek' },
  { type: 'openai', label: 'OpenAI' },
  { type: 'anthropic', label: 'Anthropic' },
  { type: 'minimax', label: 'MiniMax' },
  { type: 'gemini', label: 'Gemini' },
];

const PROVIDER_DEFAULTS: Record<ProviderType, { baseUrl: string; model: string }> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-20250506',
  },
  minimax: {
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'abab6.5s-chat',
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    model: 'gemini-2.0-flash-exp',
  },
};

interface ProviderConfigProps {
  onComplete?: () => void;
}

export function ProviderConfig({ onComplete }: ProviderConfigProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [existingConfig, setExistingConfig] = useState<ProviderConfig | null>(null);
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
  const [success, setSuccess] = useState(false);

  // Load config when provider changes
  useEffect(() => {
    const loadConfig = async () => {
      if (!selectedProvider) return;

      const config = await storage.getConfig(selectedProvider);
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
        const defaults = PROVIDER_DEFAULTS[selectedProvider];
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
  }, [selectedProvider]);

  const handleProviderSelect = (provider: ProviderType) => {
    setSelectedProvider(provider);
    setError(null);
    setSuccess(false);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
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
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      await storage.saveConfig(selectedProvider, {
        baseUrl: formData.baseUrl.trim(),
        apiKey: formData.apiKey.trim(),
        model: formData.model.trim(),
        maxTokens: parseInt(formData.maxTokens, 10),
        temperature: parseFloat(formData.temperature),
      });
      setSuccess(true);
      setExistingConfig(await storage.getConfig(selectedProvider));
      setTimeout(() => {
        setSuccess(false);
        onComplete?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      await storage.deleteConfig(selectedProvider);
      setExistingConfig(null);
      // Reset to defaults
      const defaults = PROVIDER_DEFAULTS[selectedProvider];
      setFormData({
        baseUrl: defaults.baseUrl,
        apiKey: '',
        model: defaults.model,
        maxTokens: '4000',
        temperature: '0.7',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <S.ProviderContainer>
      <S.ProviderContent>
        <S.ProviderHeader>
          <S.ProviderTitle>Provider Configuration</S.ProviderTitle>
        </S.ProviderHeader>

        {/* Provider Tabs */}
        <S.ProviderTabsContainer>
          {PROVIDERS.map(({ type, label }) => (
            <S.ProviderTabButton
              key={type}
              $active={selectedProvider === type}
              onClick={() => handleProviderSelect(type)}
            >
              {label}
            </S.ProviderTabButton>
          ))}
        </S.ProviderTabsContainer>

        {selectedProvider ? (
          <>
            {/* Provider Type Selector */}
            <S.ProviderFormGroup>
              <S.ProviderLabel>Provider</S.ProviderLabel>
              <S.ProviderSelect
                value={selectedProvider}
                disabled={!!existingConfig}
                onChange={e => handleProviderSelect(e.target.value as ProviderType)}
              >
                {PROVIDERS.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </S.ProviderSelect>
            </S.ProviderFormGroup>

            {/* Base URL */}
            <S.ProviderFormGroup>
              <S.ProviderLabel>API Base URL</S.ProviderLabel>
              <S.ProviderInput
                type="url"
                value={formData.baseUrl}
                onChange={handleInputChange('baseUrl')}
                placeholder="https://api.example.com/v1"
                disabled={isLoading}
              />
            </S.ProviderFormGroup>

            {/* API Key */}
            <S.ProviderFormGroup>
              <S.ProviderLabel>API Key</S.ProviderLabel>
              <S.ProviderInput
                type="password"
                value={formData.apiKey}
                onChange={handleInputChange('apiKey')}
                placeholder="sk-..."
                disabled={isLoading}
              />
            </S.ProviderFormGroup>

            {/* Model */}
            <S.ProviderFormGroup>
              <S.ProviderLabel>Model</S.ProviderLabel>
              <S.ProviderInput
                type="text"
                value={formData.model}
                onChange={handleInputChange('model')}
                placeholder="Model name"
                disabled={isLoading}
              />
            </S.ProviderFormGroup>

            {/* Advanced Toggle */}
            <S.AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </S.AdvancedToggle>

            {/* Advanced Settings */}
            {showAdvanced && (
              <S.AdvancedSettings>
                <S.GridRow>
                  <S.ProviderFormGroup>
                    <S.ProviderLabel>Max Tokens</S.ProviderLabel>
                    <S.ProviderInput
                      type="text"
                      value={formData.maxTokens}
                      onChange={handleInputChange('maxTokens')}
                      disabled={isLoading}
                    />
                  </S.ProviderFormGroup>
                  <S.ProviderFormGroup>
                    <S.ProviderLabel>Temperature</S.ProviderLabel>
                    <S.ProviderInput
                      type="text"
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
              <S.ProviderError>
                <p>{error}</p>
              </S.ProviderError>
            )}

            {/* Success Message */}
            {success && (
              <S.ProviderSuccess>
                <p>{existingConfig ? 'Configuration updated!' : 'Configuration saved!'}</p>
              </S.ProviderSuccess>
            )}

            {/* Actions */}
            <S.ButtonRow>
              <S.ProviderButton onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : existingConfig ? 'Update' : 'Save'}
              </S.ProviderButton>
              {existingConfig && (
                <S.ProviderButton
                  $variant="danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete
                </S.ProviderButton>
              )}
            </S.ButtonRow>
          </>
        ) : (
          <p style={{ color: '#5d6b68', fontSize: '14px', textAlign: 'center' }}>
            Select a provider to configure
          </p>
        )}
      </S.ProviderContent>
    </S.ProviderContainer>
  );
}
