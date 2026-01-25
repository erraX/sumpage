/**
 * ProviderConfig storage - CRUD operations for provider configurations
 */
import type { ProviderConfig } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'providerConfigs';

// Get all provider configurations
export async function getConfigs(): Promise<ProviderConfig[]> {
  if (!isChromeStorageAvailable()) return [];
  try {
    return await getValue<ProviderConfig[]>(STORAGE_KEY, []);
  } catch {
    console.error('[ProviderConfigStorage] Failed to get configs');
    return [];
  }
}

// Save all provider configurations
export async function saveConfigs(configs: ProviderConfig[]): Promise<void> {
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

// Get a single config by ID
export async function getConfig(id: string): Promise<ProviderConfig | null> {
  const configs = await getConfigs();
  return configs.find((c) => c.id === id) || null;
}

// Add a new provider config
export async function addConfig(
  data: Omit<ProviderConfig, 'id'>
): Promise<ProviderConfig> {
  const configs = await getConfigs();
  const newConfig: ProviderConfig = {
    ...data,
    id: `prov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  configs.push(newConfig);
  await saveConfigs(configs);
  return newConfig;
}

// Update an existing config
export async function updateConfig(
  id: string,
  updates: Partial<ProviderConfig>
): Promise<ProviderConfig | null> {
  const configs = await getConfigs();
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) return null;

  configs[index] = {
    ...configs[index],
    ...updates,
  };
  await saveConfigs(configs);
  return configs[index];
}

// Delete a config by ID
export async function deleteConfig(id: string): Promise<boolean> {
  const configs = await getConfigs();
  const filtered = configs.filter((c) => c.id !== id);
  if (filtered.length === configs.length) return false;
  await saveConfigs(filtered);
  return true;
}

// Find config by API key (for validation)
export async function findByApiKey(apiKey: string): Promise<ProviderConfig | null> {
  const configs = await getConfigs();
  return configs.find((c) => c.apiKey === apiKey) || null;
}

// Initialize provider configs storage (no defaults - user must add their own)
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  // Ensure storage key exists, but don't add default configs
  // Provider configs are user-specific (API keys)
  const configs = await getConfigs();
  if (configs.length === 0) {
    // Storage is ready, but empty - user needs to add their provider
  }
}
