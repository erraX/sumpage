/**
 * Templates storage module - Handles all prompt template persistence
 */
import type { PromptTemplate } from '../../types';
import {
  getStorageValue,
  setStorageValue,
  isChromeStorageAvailable,
} from './storage';
import { DEFAULT_PROMPT_TEMPLATE } from '../../types';

// Storage keys
const PROMPT_TEMPLATES_KEY = 'promptTemplates';
const SELECTED_PROMPT_ID_KEY = 'selectedPromptId';

// Get all prompt templates
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  if (!isChromeStorageAvailable()) {
    return [];
  }

  try {
    const result = await getStorageValue<PromptTemplate[]>(PROMPT_TEMPLATES_KEY, []);
    return result;
  } catch {
    console.error('Failed to get prompt templates');
    return [];
  }
}

// Save all prompt templates
export async function savePromptTemplates(templates: PromptTemplate[]): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }

  try {
    await setStorageValue(PROMPT_TEMPLATES_KEY, templates);
  } catch (error) {
    console.error('Failed to save prompt templates:', error);
    throw error;
  }
}

// Get a single template by ID
export async function getPromptTemplate(id: string): Promise<PromptTemplate | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }

  try {
    const templates = await getPromptTemplates();
    return templates.find((t) => t.id === id) || null;
  } catch {
    return null;
  }
}

// Add a new template
export async function addPromptTemplate(
  template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PromptTemplate> {
  const templates = await getPromptTemplates();
  const newTemplate: PromptTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  templates.push(newTemplate);
  await savePromptTemplates(templates);
  return newTemplate;
}

// Update an existing template
export async function updatePromptTemplate(
  id: string,
  updates: Partial<PromptTemplate>
): Promise<PromptTemplate | null> {
  const templates = await getPromptTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) {
    return null;
  }

  const updatedTemplate: PromptTemplate = {
    ...templates[index],
    ...updates,
    id: templates[index].id, // Prevent ID modification
    createdAt: templates[index].createdAt, // Preserve creation time
    updatedAt: Date.now(),
  };

  templates[index] = updatedTemplate;
  await savePromptTemplates(templates);
  return updatedTemplate;
}

// Delete a template by ID
export async function deletePromptTemplate(id: string): Promise<boolean> {
  // Don't allow deleting the default template
  if (id === DEFAULT_PROMPT_TEMPLATE.id) {
    return false;
  }

  const templates = await getPromptTemplates();
  const filteredTemplates = templates.filter((t) => t.id !== id);

  if (filteredTemplates.length === templates.length) {
    return false; // Template not found
  }

  await savePromptTemplates(filteredTemplates);
  return true;
}

// Get the selected prompt ID
export async function getSelectedPromptId(): Promise<string | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }

  try {
    const result = await getStorageValue<string | null>(SELECTED_PROMPT_ID_KEY, null);
    return result;
  } catch {
    return null;
  }
}

// Set the selected prompt ID
export async function setSelectedPromptId(id: string | null): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }

  try {
    await setStorageValue(SELECTED_PROMPT_ID_KEY, id);
  } catch (error) {
    console.error('Failed to set selected prompt ID:', error);
  }
}

// Set a template as the default
export async function setDefaultPromptTemplate(id: string): Promise<boolean> {
  const templates = await getPromptTemplates();
  const updatedTemplates = templates.map((t) => ({
    ...t,
    isDefault: t.id === id,
  }));

  await savePromptTemplates(updatedTemplates);
  return true;
}

// Initialize default templates if not present
export async function initializePromptTemplates(
  defaultTemplate: PromptTemplate
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }

  try {
    const templates = await getPromptTemplates();
    if (templates.length === 0) {
      await savePromptTemplates([defaultTemplate]);
    }
  } catch (error) {
    console.error('Failed to initialize prompt templates:', error);
  }
}
