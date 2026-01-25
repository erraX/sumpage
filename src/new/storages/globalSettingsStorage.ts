/**
 * GlobalSettings storage - Get/set global application settings
 */
import type { GlobalSettings } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'globalSettings';

const DEFAULT_SETTINGS: GlobalSettings = {
  providerId: '',
  promptTemplateId: '',
  toggleButtonPosition: { bottom: 20, right: 20 },
};

// Get global settings
export async function getSettings(): Promise<GlobalSettings> {
  if (!isChromeStorageAvailable()) return DEFAULT_SETTINGS;
  try {
    return await getValue<GlobalSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
  } catch {
    console.error('[GlobalSettingsStorage] Failed to get settings');
    return DEFAULT_SETTINGS;
  }
}

// Save global settings
export async function saveSettings(settings: GlobalSettings): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(STORAGE_KEY, settings);
  } catch (error) {
    console.error('[GlobalSettingsStorage] Failed to save settings:', error);
    throw error;
  }
}

// Update only specific fields
export async function updateSettings(
  updates: Partial<GlobalSettings>
): Promise<GlobalSettings> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  await saveSettings(updated);
  return updated;
}

// Reset to defaults
export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
}

// Initialize settings with defaults if not present
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  const current = await getSettings();
  // Only save if we got the default fallback (no stored value)
  if (current.providerId === DEFAULT_SETTINGS.providerId &&
      current.promptTemplateId === DEFAULT_SETTINGS.promptTemplateId) {
    await saveSettings(DEFAULT_SETTINGS);
  }
}
