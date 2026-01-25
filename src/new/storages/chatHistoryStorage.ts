/**
 * ChatHistory storage - CRUD operations for chat sessions and history records
 */
import type { ChatSession, ChatHistoryRecord } from '../models';
import { getValue, setValue, isChromeStorageAvailable } from './chromeStorage';

const SESSIONS_KEY = 'chatSessions';
const RECORDS_KEY = 'chatRecords';

// Get all chat sessions
export async function getSessions(): Promise<Record<string, ChatSession>> {
  if (!isChromeStorageAvailable()) return {};
  try {
    return await getValue<Record<string, ChatSession>>(SESSIONS_KEY, {});
  } catch {
    console.error('[ChatHistoryStorage] Failed to get sessions');
    return {};
  }
}

// Save all chat sessions
export async function saveSessions(
  sessions: Record<string, ChatSession>
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(SESSIONS_KEY, sessions);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to save sessions:', error);
    throw error;
  }
}

// Get session by page URL
export async function getSessionByUrl(
  pageUrl: string
): Promise<ChatSession | null> {
  const sessions = await getSessions();
  return sessions[pageUrl] || null;
}

// Create or update session for a page
export async function upsertSession(
  pageUrl: string,
  sessionData: Omit<ChatSession, 'id' | 'pageUrl' | 'createdAt' | 'updatedAt'>
): Promise<ChatSession> {
  const sessions = await getSessions();
  const now = Date.now();
  const existing = sessions[pageUrl];

  const session: ChatSession = existing
    ? {
        ...existing,
        ...sessionData,
        updatedAt: now,
      }
    : {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        pageUrl,
        createdAt: now,
        updatedAt: now,
        ...sessionData,
      };

  sessions[pageUrl] = session;
  await saveSessions(sessions);
  return session;
}

// Delete session by page URL
export async function deleteSession(pageUrl: string): Promise<boolean> {
  const sessions = await getSessions();
  if (!sessions[pageUrl]) return false;
  delete sessions[pageUrl];
  await saveSessions(sessions);
  return true;
}

// ============ Chat History Records ============

// Get all history records
export async function getRecords(): Promise<Record<string, ChatHistoryRecord>> {
  if (!isChromeStorageAvailable()) return {};
  try {
    return await getValue<Record<string, ChatHistoryRecord>>(RECORDS_KEY, {});
  } catch {
    console.error('[ChatHistoryStorage] Failed to get records');
    return {};
  }
}

// Save all history records
export async function saveRecords(
  records: Record<string, ChatHistoryRecord>
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error('Chrome storage is not available');
  }
  try {
    await setValue(RECORDS_KEY, records);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to save records:', error);
    throw error;
  }
}

// Get a single record by ID
export async function getRecord(
  id: string
): Promise<ChatHistoryRecord | null> {
  const records = await getRecords();
  return records[id] || null;
}

// Create a new history record
export async function createRecord(
  messages: ChatHistoryRecord['messages']
): Promise<ChatHistoryRecord> {
  const records = await getRecords();
  const now = Date.now();
  const id = `rec-${now}-${Math.random().toString(36).slice(2, 9)}`;
  const record: ChatHistoryRecord = {
    id,
    messages,
    createdAt: now,
  };
  records[id] = record;
  await saveRecords(records);
  return record;
}

// Update a history record
export async function updateRecord(
  id: string,
  messages: ChatHistoryRecord['messages']
): Promise<ChatHistoryRecord | null> {
  const records = await getRecords();
  if (!records[id]) return null;
  records[id] = { ...records[id], messages };
  await saveRecords(records);
  return records[id];
}

// Delete a history record
export async function deleteRecord(id: string): Promise<boolean> {
  const records = await getRecords();
  if (!records[id]) return false;
  delete records[id];
  await saveRecords(records);
  return true;
}

// Clear all chat data
export async function clearAll(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  await saveSessions({});
  await saveRecords({});
}

// Initialize chat history storage (starts empty)
export async function initialize(): Promise<void> {
  if (!isChromeStorageAvailable()) return;
  // Chat history should start empty - ensure clean state
  const sessions = await getSessions();
  const records = await getRecords();
  if (Object.keys(sessions).length > 0 || Object.keys(records).length > 0) {
    // Already has data, don't clear
    return;
  }
  // Storage initialized, starting with empty state
}
