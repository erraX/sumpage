import type { DeepSeekConfig } from "../types";

const STORAGE_KEYS = {
  DEEPSEEK_CONFIG: "deepseekConfig",
} as const;

function isChromeStorageAvailable(): boolean {
  return !!(typeof chrome !== "undefined" && chrome.storage && chrome.storage.local);
}

export async function getDeepSeekConfig(): Promise<DeepSeekConfig | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }
  const result = await chrome.storage.local.get(STORAGE_KEYS.DEEPSEEK_CONFIG);
  return result[STORAGE_KEYS.DEEPSEEK_CONFIG] || null;
}

export async function saveDeepSeekConfig(config: DeepSeekConfig): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error("Chrome storage is not available");
  }
  await chrome.storage.local.set({
    [STORAGE_KEYS.DEEPSEEK_CONFIG]: config,
  });
}

export async function clearDeepSeekConfig(): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }
  await chrome.storage.local.remove(STORAGE_KEYS.DEEPSEEK_CONFIG);
}
