/**
 * ProviderConfig storage - CRUD operations for provider configurations
 * Stores configs as an object: { deepseek: {...}, openai: {...}, minimax: {...} }
 */
import type { ProviderConfig, ProviderType } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'providerConfigs'; // New key for object structure

// Get all provider configs
export async function getConfigs(): Promise<
  Record<ProviderType, ProviderConfig>
> {
  if (!isChromeStorageAvailable())
    return {} as Record<ProviderType, ProviderConfig>;
  try {
    return await getValue<Record<ProviderType, ProviderConfig>>(
      STORAGE_KEY,
      {} as Record<ProviderType, ProviderConfig>
    );
  } catch {
    console.error('[ProviderConfigStorage] Failed to get configs');
    return {} as Record<ProviderType, ProviderConfig>;
  }
}

// Save all provider configs
export async function saveConfigs(
  configs: Record<ProviderType, ProviderConfig>
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(STORAGE_KEY, configs);
  } catch (error) {
    console.error('[ProviderConfigStorage] Failed to save configs:', error);
    throw error;
  }
}

// Clear all provider configs
export async function clearConfigs(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  try {
    await setValue(STORAGE_KEY, {});
  } catch (error) {
    console.error('[ProviderConfigStorage] Failed to clear configs:', error);
  }
}

// Get a single provider config by provider type
export async function getConfig(
  provider: ProviderType
): Promise<ProviderConfig | null> {
  const configs = await getConfigs();
  return configs[provider] ?? null;
}

// Save a single provider config
export async function saveConfig(
  provider: ProviderType,
  config: Omit<ProviderConfig, 'id' | 'provider'>
): Promise<ProviderConfig> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    const configs = await getConfigs();
    const newConfig: ProviderConfig = {
      ...config,
      provider,
      id: `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    configs[provider] = newConfig;
    await setValue(STORAGE_KEY, configs);
    return newConfig;
  } catch (error) {
    console.error('[ProviderConfigStorage] Failed to save config:', error);
    throw error;
  }
}

// Update an existing config
export async function updateConfig(
  provider: ProviderType,
  updates: Partial<ProviderConfig>
): Promise<ProviderConfig | null> {
  const configs = await getConfigs();
  const existing = configs[provider];
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  configs[provider] = updated;
  await saveConfigs(configs);
  return updated;
}

// Delete a provider config
export async function deleteConfig(provider: ProviderType): Promise<boolean> {
  const configs = await getConfigs();
  if (!configs[provider]) return false;

  delete configs[provider];
  await saveConfigs(configs);
  return true;
}

// Check if a specific provider is configured
export async function isProviderConfigured(
  provider: ProviderType
): Promise<boolean> {
  const config = await getConfig(provider);
  return !!(config?.apiKey && config?.baseUrl);
}

// Check if any provider is configured
export async function isAnyConfigured(): Promise<boolean> {
  const configs = await getConfigs();
  return Object.values(configs).some(
    (config) => config?.apiKey && config?.baseUrl
  );
}

// Get list of configured providers
export async function getConfiguredProviders(): Promise<ProviderType[]> {
  const configs = await getConfigs();
  return Object.entries(configs)
    .filter(([, config]) => config?.apiKey && config?.baseUrl)
    .map(([provider]) => provider as ProviderType);
}

// Initialize provider configs storage
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  // No default configs - user must add their own
}
