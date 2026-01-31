/**
 * ChatHistory storage - Uses 'chatHistory' key for backward compatibility
 */
import type { ChatMessage } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const STORAGE_KEY = 'chatHistory';

interface ChatHistoryRecord {
  url: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface ChatHistoryStorage {
  [url: string]: ChatHistoryRecord;
}

// Get chat history for a specific URL
export async function getChatHistory(url: string): Promise<ChatMessage[] | null> {
  if (!isChromeStorageAvailable()) return null;
  try {
    const result = await getValue<ChatHistoryStorage>(STORAGE_KEY, {});
    return result[url]?.messages || null;
  } catch {
    console.error('[ChatHistoryStorage] Failed to get chat history');
    return null;
  }
}

// Save chat history for a specific URL
export async function saveChatHistory(
  url: string,
  title: string,
  messages: ChatMessage[]
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    const result = await getValue<ChatHistoryStorage>(STORAGE_KEY, {});
    result[url] = {
      url,
      title,
      messages,
      lastUpdated: Date.now(),
    };
    await setValue(STORAGE_KEY, result);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to save chat history:', error);
    throw error;
  }
}

// Clear chat history for a specific URL
export async function clearChatHistory(url: string): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  try {
    const result = await getValue<ChatHistoryStorage>(STORAGE_KEY, {});
    delete result[url];
    await setValue(STORAGE_KEY, result);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to clear chat history:', error);
  }
}

// Get all chat history records
export async function getAllChatHistory(): Promise<ChatHistoryRecord[]> {
  if (!isChromeStorageAvailable()) return [];
  try {
    const result = await getValue<ChatHistoryStorage>(STORAGE_KEY, {});
    return Object.values(result);
  } catch {
    console.error('[ChatHistoryStorage] Failed to get all chat history');
    return [];
  }
}

// Clear all chat history
export async function clearAll(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  try {
    await setValue(STORAGE_KEY, {});
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to clear all chat history:', error);
  }
}

// Initialize chat history storage
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  // Starts empty, nothing to initialize
}

// ============ Session-based API (for new model compatibility) ============

export interface Session {
  pageUrl: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export async function getSessions(): Promise<Record<string, Session>> {
  if (!isChromeStorageAvailable()) return {};
  try {
    const result = await getValue<ChatHistoryStorage>(STORAGE_KEY, {});
    const sessions: Record<string, Session> = {};
    for (const [url, record] of Object.entries(result)) {
      sessions[url] = {
        pageUrl: url,
        messages: record.messages,
        lastUpdated: record.lastUpdated,
      };
    }
    return sessions;
  } catch {
    return {};
  }
}

export async function getSession(url: string): Promise<Session | null> {
  const history = await getChatHistory(url);
  if (!history) return null;
  return {
    pageUrl: url,
    messages: history,
    lastUpdated: Date.now(),
  };
}

export async function upsertSession(
  url: string,
  messages: ChatMessage[]
): Promise<Session> {
  const title = typeof document !== 'undefined' ? document.title : 'Untitled';
  await saveChatHistory(url, title, messages);
  return {
    pageUrl: url,
    messages,
    lastUpdated: Date.now(),
  };
}

export async function deleteSession(url: string): Promise<boolean> {
  const history = await getChatHistory(url);
  if (!history) return false;
  await clearChatHistory(url);
  return true;
}
