/**
 * useProviderConfigs - Zustand hook for managing provider configurations
 */
import { create } from 'zustand';
import type { ProviderConfig } from '../models';
import * as storage from '../storages/providerConfigStorage';

interface State {
  configs: ProviderConfig[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  initialize: () => Promise<void>;
  add: (data: Omit<ProviderConfig, 'id'>) => Promise<ProviderConfig>;
  update: (id: string, updates: Partial<ProviderConfig>) => Promise<ProviderConfig | null>;
  delete: (id: string) => Promise<boolean>;
  select: (id: string | null) => void;
  getSelected: () => ProviderConfig | null;
  clearError: () => void;
}

export const useProviderConfigs = create<State & Actions>((set, get) => ({
  configs: [],
  selectedId: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const configs = await storage.getConfigs();
      set({ configs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load configs', isLoading: false });
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newConfig = await storage.addConfig(data);
      set((state) => ({
        configs: [...state.configs, newConfig],
        isLoading: false,
      }));
      return newConfig;
    } catch (error) {
      set({ error: 'Failed to add config', isLoading: false });
      throw error;
    }
  },

  update: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await storage.updateConfig(id, updates);
      if (updated) {
        set((state) => ({
          configs: state.configs.map((c) => (c.id === id ? updated : c)),
          isLoading: false,
        }));
      } else {
        set({ error: 'Config not found', isLoading: false });
      }
      return updated;
    } catch (error) {
      set({ error: 'Failed to update config', isLoading: false });
      throw error;
    }
  },

  delete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await storage.deleteConfig(id);
      if (success) {
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          isLoading: false,
        }));
      } else {
        set({ error: 'Config not found', isLoading: false });
      }
      return success;
    } catch (error) {
      set({ error: 'Failed to delete config', isLoading: false });
      throw error;
    }
  },

  select: (id) => set({ selectedId: id }),

  getSelected: () => {
    const { configs, selectedId } = get();
    return selectedId ? configs.find((c) => c.id === selectedId) || null : null;
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
