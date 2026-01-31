/**
 * usePromptTemplates - Zustand hook for managing prompt templates
 */
import { create } from 'zustand';
import type { PromptTemplate } from '../models';
import * as storage from '../storages/promptTemplateStorage';
import { getSelectedPromptId, setSelectedPromptId } from '../storages/globalSettingsStorage';

interface State {
  templates: PromptTemplate[];
  selectedPromptId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  add: (data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptTemplate>;
  update: (id: string, updates: Partial<PromptTemplate>) => Promise<PromptTemplate | null>;
  delete: (id: string) => Promise<boolean>;
  selectTemplate: (id: string | null) => Promise<void>;
  initialize: (defaultTemplate: PromptTemplate) => Promise<void>;
  clearError: () => void;
}

export const usePromptTemplates = create<State & Actions>((set, get) => ({
  templates: [],
  selectedPromptId: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await storage.getTemplates();
      const selectedId = await getSelectedPromptId();
      set({ templates, selectedPromptId: selectedId, isLoading: false });
    } catch (error) {
      console.error('[PromptTemplates] Failed to load templates', error);
      set({ error: 'Failed to load templates', isLoading: false });
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await storage.addTemplate(data);
      set((state) => ({
        templates: [...state.templates, newTemplate],
        isLoading: false,
      }));
      return newTemplate;
    } catch (error) {
      set({ error: 'Failed to add template', isLoading: false });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await storage.updateTemplate(id, updates);
      if (updated) {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? updated : t)),
          isLoading: false,
        }));
      } else {
        set({ error: 'Template not found', isLoading: false });
      }
      return updated;
    } catch (error) {
      set({ error: 'Failed to update template', isLoading: false });
      throw error;
    }
  },

  delete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await storage.deleteTemplate(id);
      if (success) {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedPromptId: state.selectedPromptId === id ? null : state.selectedPromptId,
          isLoading: false,
        }));
      } else {
        set({ error: 'Template not found', isLoading: false });
      }
      return success;
    } catch (error) {
      set({ error: 'Failed to delete template', isLoading: false });
      throw error;
    }
  },

  selectTemplate: async (id) => {
    await setSelectedPromptId(id);
    set({ selectedPromptId: id });
  },

  initialize: async (defaultTemplate) => {
    await storage.initialize(defaultTemplate);
    await get().load();
  },

  clearError: () => set({ error: null }),
}));
