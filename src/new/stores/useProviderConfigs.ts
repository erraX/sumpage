/**
 * useProviderConfigs - Zustand hook for managing provider configurations
 * Supports multiple providers stored as an object keyed by provider type
 */
import { create } from 'zustand';
import type { ProviderConfig, ProviderType } from '../models';
import * as storage from '../storages/providerConfigStorage';

interface State {
  configs: Record<ProviderType, ProviderConfig>;
  selectedProvider: ProviderType | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  initialize: () => Promise<void>;
  saveConfig: (provider: ProviderType, config: Omit<ProviderConfig, 'id' | 'provider'>) => Promise<void>;
  deleteConfig: (provider: ProviderType) => Promise<void>;
  clearConfigs: () => Promise<void>;
  selectProvider: (provider: ProviderType | null) => void;
  checkConfiguration: () => Promise<boolean>;
  clearError: () => void;
}

export const useProviderConfigs = create<State & Actions>((set, get) => ({
  configs: {} as Record<ProviderType, ProviderConfig>,
  selectedProvider: null,
  isConfigured: false,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const configs = await storage.getConfigs();
      const isConfigured = await storage.isAnyConfigured();
      const configuredProviders = await storage.getConfiguredProviders();
      const selectedProvider = configuredProviders.length > 0 ? configuredProviders[0] : null;
      set({ configs, isConfigured, selectedProvider, isLoading: false });
    } catch {
      set({ error: 'Failed to load configs', isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.initialize();
      await get().load();
    } catch {
      set({ error: 'Failed to initialize', isLoading: false });
    }
  },

  saveConfig: async (provider, config) => {
    set({ isLoading: true, error: null });
    try {
      await storage.saveConfig(provider, config);
      const configs = await storage.getConfigs();
      const isConfigured = await storage.isAnyConfigured();
      set({ configs, isConfigured, isLoading: false });
    } catch {
      set({ error: 'Failed to save config', isLoading: false });
      throw new Error('Failed to save config');
    }
  },

  deleteConfig: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      await storage.deleteConfig(provider);
      const configs = await storage.getConfigs();
      const isConfigured = await storage.isAnyConfigured();
      const selectedProvider = get().selectedProvider === provider
        ? null
        : get().selectedProvider;
      set({ configs, isConfigured, selectedProvider, isLoading: false });
    } catch {
      set({ error: 'Failed to delete config', isLoading: false });
      throw new Error('Failed to delete config');
    }
  },

  clearConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.clearConfigs();
      set({ configs: {} as Record<ProviderType, ProviderConfig>, isConfigured: false, selectedProvider: null, isLoading: false });
    } catch {
      set({ error: 'Failed to clear configs', isLoading: false });
      throw new Error('Failed to clear configs');
    }
  },

  selectProvider: (provider) => {
    set({ selectedProvider: provider });
  },

  checkConfiguration: async () => {
    const configured = await storage.isAnyConfigured();
    set({ isConfigured: configured });
    return configured;
  },

  clearError: () => set({ error: null }),
}));
