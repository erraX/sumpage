/**
 * PromptTemplate storage - CRUD operations for prompt templates
 */
import type { PromptTemplate } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'promptTemplates';

// Get all prompt templates
export async function getTemplates(): Promise<PromptTemplate[]> {
  if (!isChromeStorageAvailable()) return [];
  try {
    return await getValue<PromptTemplate[]>(STORAGE_KEY, []);
  } catch {
    console.error('[PromptTemplateStorage] Failed to get templates');
    return [];
  }
}

// Save all prompt templates
export async function saveTemplates(templates: PromptTemplate[]): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(STORAGE_KEY, templates);
  } catch (error) {
    console.error('[PromptTemplateStorage] Failed to save templates:', error);
    throw error;
  }
}

// Get a single template by ID
export async function getTemplate(id: string): Promise<PromptTemplate | null> {
  const templates = await getTemplates();
  return templates.find((t) => t.id === id) || null;
}

// Add a new template
export async function addTemplate(
  data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PromptTemplate> {
  const templates = await getTemplates();
  const now = Date.now();
  const newTemplate: PromptTemplate = {
    ...data,
    id: `tpl-${now}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  templates.push(newTemplate);
  await saveTemplates(templates);
  return newTemplate;
}

// Update an existing template
export async function updateTemplate(
  id: string,
  updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt'>>
): Promise<PromptTemplate | null> {
  const templates = await getTemplates();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await saveTemplates(templates);
  return templates[index];
}

// Delete a template by ID
export async function deleteTemplate(id: string): Promise<boolean> {
  const templates = await getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  await saveTemplates(filtered);
  return true;
}

// Initialize with default template if empty
export async function initialize(defaultTemplate: PromptTemplate): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  const templates = await getTemplates();
  if (templates.length === 0) {
    await saveTemplates([defaultTemplate]);
  }
}
