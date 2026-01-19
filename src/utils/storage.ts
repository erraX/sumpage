import type { DeepSeekConfig, PromptTemplate } from "../types";

const STORAGE_KEYS = {
  DEEPSEEK_CONFIG: "deepseekConfig",
  PROMPT_TEMPLATES: "promptTemplates",
  SELECTED_PROMPT_ID: "selectedPromptId",
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

// Prompt template functions
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  if (!isChromeStorageAvailable()) return [];
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROMPT_TEMPLATES);
  return result[STORAGE_KEYS.PROMPT_TEMPLATES] || [];
}

export async function savePromptTemplates(templates: PromptTemplate[]): Promise<void> {
  if (!isChromeStorageAvailable()) throw new Error("Chrome storage not available");
  await chrome.storage.local.set({ [STORAGE_KEYS.PROMPT_TEMPLATES]: templates });
}

export async function getPromptTemplate(id: string): Promise<PromptTemplate | null> {
  const templates = await getPromptTemplates();
  return templates.find(t => t.id === id) || null;
}

export async function addPromptTemplate(
  template: Omit<PromptTemplate, "id" | "createdAt" | "updatedAt">
): Promise<PromptTemplate> {
  const templates = await getPromptTemplates();
  const now = Date.now();
  const newTemplate: PromptTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  templates.push(newTemplate);
  await savePromptTemplates(templates);
  return newTemplate;
}

export async function updatePromptTemplate(
  id: string,
  updates: Partial<Omit<PromptTemplate, "id" | "createdAt">>
): Promise<PromptTemplate | null> {
  const templates = await getPromptTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await savePromptTemplates(templates);
  return templates[index];
}

export async function deletePromptTemplate(id: string): Promise<boolean> {
  const templates = await getPromptTemplates();
  const filtered = templates.filter(t => t.id !== id);
  if (filtered.length === templates.length) return false;
  await savePromptTemplates(filtered);
  return true;
}

export async function setDefaultPromptTemplate(id: string): Promise<void> {
  const templates = await getPromptTemplates();
  const templatesWithDefault = templates.map(t => ({
    ...t,
    isDefault: t.id === id,
  }));
  await savePromptTemplates(templatesWithDefault);
}

export async function getDefaultPromptTemplate(): Promise<PromptTemplate | null> {
  const templates = await getPromptTemplates();
  return templates.find(t => t.isDefault) || null;
}

export async function initializePromptTemplates(
  defaultTemplate: PromptTemplate
): Promise<void> {
  const existing = await getPromptTemplates();
  if (existing.length === 0) {
    await savePromptTemplates([defaultTemplate]);
  }
}

// Per-chat selected prompt override
export async function getSelectedPromptId(): Promise<string | null> {
  if (!isChromeStorageAvailable()) return null;
  const result = await chrome.storage.local.get(STORAGE_KEYS.SELECTED_PROMPT_ID);
  return result[STORAGE_KEYS.SELECTED_PROMPT_ID] || null;
}

export async function setSelectedPromptId(id: string | null): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  if (id === null) {
    await chrome.storage.local.remove(STORAGE_KEYS.SELECTED_PROMPT_ID);
  } else {
    await chrome.storage.local.set({ [STORAGE_KEYS.SELECTED_PROMPT_ID]: id });
  }
}
