/**
 * useChatSession - Zustand hook for managing chat sessions
 */
import { create } from 'zustand';
import type { ChatSession, ChatMessage } from '../models';
import * as storage from '../storages/chatHistoryStorage';

interface State {
  sessions: Record<string, ChatSession>;
  currentSession: ChatSession | null;
  currentMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface Actions {
  load: () => Promise<void>;
  initialize: () => Promise<void>;
  loadSession: (pageUrl: string) => Promise<void>;
  createSession: (pageUrl: string) => Promise<ChatSession>;
  addMessage: (pageUrl: string, message: ChatMessage) => Promise<void>;
  clearSession: (pageUrl: string) => Promise<void>;
  deleteSession: (pageUrl: string) => Promise<void>;
  clearError: () => void;
}

export const useChatSession = create<State & Actions>((set, get) => ({
  sessions: {},
  currentSession: null,
  currentMessages: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await storage.getSessions();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load sessions', isLoading: false });
    }
  },

  loadSession: async (pageUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await storage.getSessionByUrl(pageUrl);
      if (session) {
        // Load messages from history records
        const records = await storage.getRecords();
        const messages: ChatMessage[] = [];
        for (const recordId of session.history) {
          const record = records[recordId];
          if (record) {
            messages.push(...record.messages);
          }
        }
        set({
          currentSession: session,
          currentMessages: messages,
          isLoading: false,
        });
      } else {
        set({
          currentSession: null,
          currentMessages: [],
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to load session', isLoading: false });
    }
  },

  createSession: async (pageUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await storage.upsertSession(pageUrl, { history: [] });
      set((state) => ({
        sessions: { ...state.sessions, [pageUrl]: session },
        currentSession: session,
        currentMessages: [],
        isLoading: false,
      }));
      return session;
    } catch (error) {
      set({ error: 'Failed to create session', isLoading: false });
      throw error;
    }
  },

  addMessage: async (pageUrl: string, message: ChatMessage) => {
    set({ isLoading: true, error: null });
    try {
      // Get or create session
      let session = await storage.getSessionByUrl(pageUrl);
      if (!session) {
        session = await storage.upsertSession(pageUrl, { history: [] });
      }

      // Create new history record
      const newRecord = await storage.createRecord([message]);

      // Update session with new record
      const updatedSession = await storage.upsertSession(pageUrl, {
        history: [...session.history, newRecord.id],
      });

      // Update local state
      set((state) => ({
        sessions: { ...state.sessions, [pageUrl]: updatedSession },
        currentSession: updatedSession,
        currentMessages: [...state.currentMessages, message],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add message', isLoading: false });
      throw error;
    }
  },

  clearSession: async (pageUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      // Delete all history records for this session
      const session = await storage.getSessionByUrl(pageUrl);
      if (session) {
        for (const recordId of session.history) {
          await storage.deleteRecord(recordId);
        }
      }

      // Clear session history
      const clearedSession = await storage.upsertSession(pageUrl, { history: [] });

      set((state) => ({
        sessions: { ...state.sessions, [pageUrl]: clearedSession },
        currentSession: clearedSession,
        currentMessages: [],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to clear session', isLoading: false });
      throw error;
    }
  },

  deleteSession: async (pageUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await storage.getSessionByUrl(pageUrl);

      // Delete all history records
      if (session) {
        for (const recordId of session.history) {
          await storage.deleteRecord(recordId);
        }
      }

      // Delete session
      await storage.deleteSession(pageUrl);

      set((state) => {
        const { [pageUrl]: _, ...remainingSessions } = state.sessions;
        return {
          sessions: remainingSessions,
          currentSession: state.currentSession?.pageUrl === pageUrl ? null : state.currentSession,
          currentMessages: state.currentSession?.pageUrl === pageUrl ? [] : state.currentMessages,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Failed to delete session', isLoading: false });
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
