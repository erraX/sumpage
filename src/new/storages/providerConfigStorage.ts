/**
 * ProviderConfig storage - CRUD operations for provider configurations
 * Uses 'deepseekConfig' key for backward compatibility
 */
import type { ProviderConfig } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'deepseekConfig'; // Keep old key for backward compatibility

// Get provider config (returns first config or null for backward compat)
export async function getConfig(): Promise<ProviderConfig | null> {
  if (!isChromeStorageAvailable()) return null;
  try {
    return await getValue<ProviderConfig | null>(STORAGE_KEY, null);
  } catch {
    console.error('[ProviderConfigStorage] Failed to get config');
    return null;
  }
}

// Save provider config
export async function saveConfig(config: ProviderConfig): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(STORAGE_KEY, config);
  } catch (error) {
    console.error('[ProviderConfigStorage] Failed to save config:', error);
    throw error;
  }
}

// Clear provider config
export async function clearConfig(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  try {
    await setValue(STORAGE_KEY, null);
  } catch (error) {
    console.error('[ProviderConfigStorage] Failed to clear config:', error);
  }
}

// Check if provider is configured
export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return !!(config?.apiKey && config?.baseUrl);
}

// Get all configs (for future multi-provider support)
export async function getConfigs(): Promise<ProviderConfig[]> {
  const config = await getConfig();
  return config ? [config] : [];
}

// Save all configs (for future multi-provider support)
export async function saveConfigs(configs: ProviderConfig[]): Promise<void> {
  if (configs.length > 0) {
    await saveConfig(configs[0]);
  } else {
    await clearConfig();
  }
}

// Get a single config by ID
export async function getConfigById(id: string): Promise<ProviderConfig | null> {
  const config = await getConfig();
  return config?.id === id ? config : null;
}

// Add a new provider config
export async function addConfig(
  data: Omit<ProviderConfig, 'id'>
): Promise<ProviderConfig> {
  const newConfig: ProviderConfig = {
    ...data,
    id: `prov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  await saveConfig(newConfig);
  return newConfig;
}

// Update an existing config
export async function updateConfig(
  id: string,
  updates: Partial<ProviderConfig>
): Promise<ProviderConfig | null> {
  const config = await getConfig();
  if (!config || config.id !== id) return null;

  const updated = { ...config, ...updates };
  await saveConfig(updated);
  return updated;
}

// Delete a config by ID
export async function deleteConfig(id: string): Promise<boolean> {
  const config = await getConfig();
  if (!config || config.id !== id) return false;
  await clearConfig();
  return true;
}

// Find config by API key
export async function findByApiKey(apiKey: string): Promise<ProviderConfig | null> {
  const config = await getConfig();
  return config?.apiKey === apiKey ? config : null;
}

// Initialize provider configs storage
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  // No default configs - user must add their own
}
