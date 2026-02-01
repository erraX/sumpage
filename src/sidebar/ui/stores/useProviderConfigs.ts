/**
 * useProviderConfigs - Zustand hook for managing provider configurations
 * Supports multiple providers stored as an object keyed by provider type
 */
import { create } from 'zustand';
import type { ProviderConfig, ProviderType } from '../models';
import * as storage from '../storages/providerConfigStorage';
import { parseErrorMessage } from '../../../utils/error';

// TODO: `loading` and `error` should be in a separate state for each storage operation
interface State {
  // Loading state during storage operations
  isLoading: boolean;
  // Error message during storage operations
  error: string | null;
  // All provdier configs
  configs: Record<ProviderType, ProviderConfig>;
  // Is any provider configured
  isAnyConfigured: boolean;
}

interface Actions {
  // Load provider configs from storage
  load: () => Promise<void>;
  clearError: () => void;
  saveConfig: (
    providerType: ProviderType,
    config: Omit<ProviderConfig, 'id' | 'provider'>
  ) => Promise<void>;
  deleteConfig: (providerType: ProviderType) => Promise<void>;
  clearConfigs: () => Promise<void>;
}

export const useProviderConfigs = create<State & Actions>((set) => ({
  isLoading: false,
  error: null,

  configs: {} as Record<ProviderType, ProviderConfig>,
  isAnyConfigured: false,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const configs = await storage.getConfigs();
      const isAnyConfigured = await storage.isAnyConfigured();
      set({ configs, isAnyConfigured, isLoading: false });
    } catch (error: any) {
      const errMsg = parseErrorMessage(error) || 'Failed to load configs';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  saveConfig: async (providerType, config) => {
    set({ isLoading: true, error: null });
    try {
      await storage.saveConfig(providerType, config);
      const configs = await storage.getConfigs();
      const isAnyConfigured = await storage.isAnyConfigured();
      set({ configs, isAnyConfigured, isLoading: false });
    } catch (error: any) {
      const errMsg = parseErrorMessage(error) || 'Failed to save config';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteConfig: async (providerType) => {
    set({ isLoading: true, error: null });
    try {
      await storage.deleteConfig(providerType);
      const configs = await storage.getConfigs();
      const isAnyConfigured = await storage.isAnyConfigured();
      set({ configs, isAnyConfigured, isLoading: false });
    } catch (error: any) {
      const errMsg = parseErrorMessage(error) || 'Failed to delete config';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  clearConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      await storage.clearConfigs();
      set({
        configs: {} as Record<ProviderType, ProviderConfig>,
        isAnyConfigured: false,
        isLoading: false,
      });
    } catch (error: any) {
      const errMsg = parseErrorMessage(error) || 'Failed to clear configs';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  clearError: () => set({ error: null }),
}));
