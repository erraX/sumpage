import type { ProviderType } from '../../models';

export const PROVIDERS: { type: ProviderType; label: string }[] = [
  { type: 'deepseek', label: 'DeepSeek' },
  { type: 'openai', label: 'OpenAI' },
  { type: 'anthropic', label: 'Anthropic' },
  { type: 'minimax', label: 'MiniMax' },
  { type: 'gemini', label: 'Gemini' },
];

export const PROVIDER_DEFAULTS: Record<
  ProviderType,
  { baseUrl: string; model: string }
> = {
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