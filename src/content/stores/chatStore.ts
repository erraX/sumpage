import { create } from 'zustand';
import type { ChatMessage } from '../../types';
import * as chatStorage from '../store/chatStorage';

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setInputValue: (value: string) => void;
  setIsLoading: (loading: boolean) => void;
  loadChatHistory: (url: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  inputValue: '',
  isLoading: false,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      // Persist to storage
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const title = typeof document !== 'undefined' ? document.title : 'Untitled';
      if (url) {
        chatStorage.saveChatHistory(url, title, newMessages).catch(console.error);
      }
      return { messages: newMessages };
    });
  },

  clearChat: () => {
    set({ messages: [], inputValue: '' });
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (url) {
      chatStorage.clearChatHistory(url).catch(console.error);
    }
  },

  setInputValue: (inputValue) => set({ inputValue }),

  setIsLoading: (isLoading) => set({ isLoading }),

  loadChatHistory: async (url: string) => {
    try {
      const history = await chatStorage.getChatHistory(url);
      set({ messages: history || [] });
    } catch (error) {
      console.error('Failed to load chat history:', error);
      set({ messages: [] });
    }
  },
}));
