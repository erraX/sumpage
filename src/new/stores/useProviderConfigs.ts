/**
 * useProviderConfigs - Zustand hook for managing provider configurations
 * Uses single config storage for backward compatibility
 */
import { create } from 'zustand';
import type { ProviderConfig } from '../models';
import * as storage from '../storages/providerConfigStorage';

interface State {
  config: ProviderConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  initialize: () => Promise<void>;
  saveConfig: (config: ProviderConfig) => Promise<void>;
  clearConfig: () => Promise<void>;
  checkConfiguration: () => Promise<boolean>;
  clearError: () => void;
}

export const useProviderConfigs = create<State & Actions>((set) => ({
  config: null,
  isConfigured: false,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await storage.getConfig();
      set({ config, isConfigured: !!config, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load config', isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.initialize();
      await get().load();
    } catch (error) {
      set({ error: 'Failed to initialize', isLoading: false });
    }
  },

  saveConfig: async (config) => {
    set({ isLoading: true, error: null });
    try {
      await storage.saveConfig(config);
      set({ config, isConfigured: true, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to save config', isLoading: false });
      throw error;
    }
  },

  clearConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.clearConfig();
      set({ config: null, isConfigured: false, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to clear config', isLoading: false });
      throw error;
    }
  },

  checkConfiguration: async () => {
    const configured = await storage.isConfigured();
    set({ isConfigured: configured });
    return configured;
  },

  clearError: () => set({ error: null }),
}));

// Helper function for get() in initialize
function get() {
  return useProviderConfigs.getState();
}
