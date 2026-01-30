/**
 * GlobalSettings storage - Get/set global application settings
 * Handles selectedPromptId key for backward compatibility
 */
import type { GlobalSettings } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'globalSettings';
const SELECTED_PROMPT_ID_KEY = 'selectedPromptId';

const DEFAULT_SETTINGS: GlobalSettings = {
  providerType: null,
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
  if (
    current.providerType === DEFAULT_SETTINGS.providerType &&
    current.promptTemplateId === DEFAULT_SETTINGS.promptTemplateId
  ) {
    await saveSettings(DEFAULT_SETTINGS);
  }
}

// ============ Selected Prompt ID (backward compatibility) ============

export async function getSelectedPromptId(): Promise<string | null> {
  if (!isChromeStorageAvailable()) return null;
  try {
    return await getValue<string | null>(SELECTED_PROMPT_ID_KEY, null);
  } catch {
    return null;
  }
}

export async function setSelectedPromptId(id: string | null): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  try {
    if (id === null) {
      await setValue(SELECTED_PROMPT_ID_KEY, null);
    } else {
      await setValue(SELECTED_PROMPT_ID_KEY, id);
    }
  } catch (error) {
    console.error(
      '[GlobalSettingsStorage] Failed to set selected prompt ID:',
      error
    );
  }
}
