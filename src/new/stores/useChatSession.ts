/**
 * useChatSession - Zustand hook for managing chat sessions
 * Uses simplified chat history storage for backward compatibility
 */
import { create } from 'zustand';
import type { ChatMessage } from '../models';
import * as storage from '../storages/chatHistoryStorage';

interface State {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  loadChatHistory: (url: string) => Promise<void>;
  addMessage: (url: string, message: ChatMessage) => Promise<void>;
  clearChat: (url: string) => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useChatSession = create<State & Actions>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  loadChatHistory: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      const history = await storage.getChatHistory(url);
      set({ messages: history || [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load chat history', isLoading: false });
    }
  },

  addMessage: async (url: string, message: ChatMessage) => {
    set({ isLoading: true, error: null });
    try {
      const currentMessages = get().messages;
      const newMessages = [...currentMessages, message];
      const title = typeof document !== 'undefined' ? document.title : 'Untitled';
      await storage.saveChatHistory(url, title, newMessages);
      set({ messages: newMessages, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add message', isLoading: false });
      throw error;
    }
  },

  clearChat: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      await storage.clearChatHistory(url);
      set({ messages: [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to clear chat', isLoading: false });
      throw error;
    }
  },

  setMessages: (messages) => set({ messages }),

  setIsLoading: (isLoading) => set({ isLoading }),

  clearError: () => set({ error: null }),
}));
