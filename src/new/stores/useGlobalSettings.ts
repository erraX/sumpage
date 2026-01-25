/**
 * useGlobalSettings - Zustand hook for managing global settings
 */
import { create } from 'zustand';
import type { GlobalSettings, ToggleButtonPosition } from '../models';
import * as storage from '../storages/globalSettingsStorage';

interface State {
  settings: GlobalSettings;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  initialize: () => Promise<void>;
  update: (updates: Partial<GlobalSettings>) => Promise<GlobalSettings>;
  updateButtonPosition: (position: ToggleButtonPosition) => Promise<void>;
  reset: () => Promise<void>;
  clearError: () => void;
}

export const useGlobalSettings = create<State & Actions>((set, get) => ({
  settings: {
    providerId: '',
    promptTemplateId: '',
    toggleButtonPosition: { bottom: 20, right: 20 },
  },
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await storage.getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load settings', isLoading: false });
    }
  },

  update: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await storage.updateSettings(updates);
      set({ settings: updated, isLoading: false });
      return updated;
    } catch (error) {
      set({ error: 'Failed to update settings', isLoading: false });
      throw error;
    }
  },

  updateButtonPosition: async (position) => {
    await get().update({ toggleButtonPosition: position });
  },

  reset: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.resetSettings();
      const settings = await storage.getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to reset settings', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.initialize();
      await get().load();
    } catch (error) {
      set({ error: 'Failed to initialize', isLoading: false });
    }
  },
}));
