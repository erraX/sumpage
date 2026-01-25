import { create } from 'zustand';
import type { DeepSeekConfig, PromptTemplate } from '../../types';
import * as settingsStorage from '../store/settingsStorage';
import * as templatesStorage from '../store/templatesStorage';

interface SettingsState {
  config: DeepSeekConfig | null;
  promptTemplates: PromptTemplate[];
  selectedPromptId: string | null;
  isLoading: boolean;

  // Actions
  loadConfig: () => Promise<void>;
  updateConfig: (config: DeepSeekConfig) => Promise<void>;
  loadTemplates: () => Promise<void>;
  addTemplate: (template: PromptTemplate) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  selectTemplate: (id: string | null) => Promise<void>;
  setSelectedPromptIdState: (id: string | null) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  config: null,
  promptTemplates: [],
  selectedPromptId: null,
  isLoading: false,

  loadConfig: async () => {
    try {
      const config = await settingsStorage.getDeepSeekConfig();
      set({ config });
    } catch (error) {
      console.error('Failed to load config:', error);
      set({ config: null });
    }
  },

  updateConfig: async (config: DeepSeekConfig) => {
    set({ isLoading: true });
    try {
      await settingsStorage.saveDeepSeekConfig(config);
      set({ config, isLoading: false });
    } catch (error) {
      console.error('Failed to save config:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadTemplates: async () => {
    try {
      const templates = await templatesStorage.getPromptTemplates();
      const selectedId = await templatesStorage.getSelectedPromptId();
      set({ promptTemplates: templates, selectedPromptId: selectedId });
    } catch (error) {
      console.error('Failed to load templates:', error);
      set({ promptTemplates: [], selectedPromptId: null });
    }
  },

  addTemplate: async (template: PromptTemplate) => {
    const { promptTemplates } = get();
    const newTemplates = [...promptTemplates, template];
    try {
      await templatesStorage.savePromptTemplates(newTemplates);
      set({ promptTemplates: newTemplates });
    } catch (error) {
      console.error('Failed to add template:', error);
      throw error;
    }
  },

  removeTemplate: async (id: string) => {
    const { promptTemplates } = get();
    try {
      const success = await templatesStorage.deletePromptTemplate(id);
      if (success) {
        const newTemplates = promptTemplates.filter((t) => t.id !== id);
        set({ promptTemplates: newTemplates });
      }
    } catch (error) {
      console.error('Failed to remove template:', error);
      throw error;
    }
  },

  selectTemplate: async (id: string | null) => {
    try {
      await templatesStorage.setSelectedPromptId(id);
      set({ selectedPromptId: id });
    } catch (error) {
      console.error('Failed to select template:', error);
    }
  },

  setSelectedPromptIdState: (id: string | null) => set({ selectedPromptId: id }),
}));
