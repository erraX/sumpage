/**
 * Chat storage module - Handles all chat-related persistence
 * Independent storage layer - no framework dependencies
 */
import type { ChatMessage } from '../../types';
import {
  getStorageValue,
  setStorageValue,
  isChromeStorageAvailable,
} from './storage';

// Storage keys
const CHAT_HISTORY_KEY = 'chatHistory';

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
  if (!isChromeStorageAvailable()) {
    return null;
  }

  try {
    const result = await getStorageValue<ChatHistoryStorage>(CHAT_HISTORY_KEY, {});
    const record = result[url];
    return record?.messages || null;
  } catch {
    console.error('Failed to get chat history');
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
    const result = await getStorageValue<ChatHistoryStorage>(CHAT_HISTORY_KEY, {});
    result[url] = {
      url,
      title,
      messages,
      lastUpdated: Date.now(),
    };
    await setStorageValue(CHAT_HISTORY_KEY, result);
  } catch (error) {
    console.error('Failed to save chat history:', error);
    throw error;
  }
}

// Clear chat history for a specific URL
export async function clearChatHistory(url: string): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }

  try {
    const result = await getStorageValue<ChatHistoryStorage>(CHAT_HISTORY_KEY, {});
    delete result[url];
    await setStorageValue(CHAT_HISTORY_KEY, result);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

// Get all chat history records
export async function getAllChatHistory(): Promise<ChatHistoryRecord[]> {
  if (!isChromeStorageAvailable()) {
    return [];
  }

  try {
    const result = await getStorageValue<ChatHistoryStorage>(CHAT_HISTORY_KEY, {});
    return Object.values(result);
  } catch {
    return [];
  }
}

// Clear all chat history
export async function clearAllChatHistory(): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }

  try {
    await setStorageValue(CHAT_HISTORY_KEY, {});
  } catch (error) {
    console.error('Failed to clear all chat history:', error);
  }
}
