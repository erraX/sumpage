/**
 * Settings storage module - Handles all settings-related persistence
 * Independent storage layer - no framework dependencies
 */
import type { DeepSeekConfig } from '../../types';
import {
  getStorageValue,
  setStorageValue,
  isChromeStorageAvailable,
} from './storage';

// Storage keys
const DEEPSEEK_CONFIG_KEY = 'deepSeekConfig';

// Get DeepSeek configuration
export async function getDeepSeekConfig(): Promise<DeepSeekConfig | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }

  try {
    return await getStorageValue<DeepSeekConfig | null>(DEEPSEEK_CONFIG_KEY, null);
  } catch {
    console.error('Failed to get DeepSeek config');
    return null;
  }
}

// Save DeepSeek configuration
export async function saveDeepSeekConfig(config: DeepSeekConfig): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }

  try {
    await setStorageValue(DEEPSEEK_CONFIG_KEY, config);
  } catch (error) {
    console.error('Failed to save DeepSeek config:', error);
    throw error;
  }
}

// Clear DeepSeek configuration
export async function clearDeepSeekConfig(): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }

  try {
    await setStorageValue(DEEPSEEK_CONFIG_KEY, null);
  } catch (error) {
    console.error('Failed to clear DeepSeek config:', error);
  }
}

// Check if DeepSeek is configured
export async function isDeepSeekConfigured(): Promise<boolean> {
  const config = await getDeepSeekConfig();
  return !!(config?.apiKey && config?.baseUrl);
}
