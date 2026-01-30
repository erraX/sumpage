/**
 * Chrome Storage primitives - Base layer for all storage operations
 * Pure functions with no external dependencies
 */

// Type definitions for Chrome storage area
interface StorageArea {
  get: (keys?: string | string[] | Record<string, unknown>) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string | string[]) => Promise<void>;
  clear: () => Promise<void>;
}

interface StorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

// Get the appropriate storage area
export function getStorageArea(area: 'local' | 'sync' | 'managed' = 'local'): StorageArea {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return createMockStorage();
  }
  return chrome.storage[area] || chrome.storage.local;
}

// Create a mock storage for SSR/non-extension environments
function createMockStorage(): StorageArea {
  const mockData: Record<string, unknown> = {};
  const storage: StorageArea = {
    get: async (keys) => {
      if (!keys) return { ...mockData };
      if (typeof keys === 'string') {
        return { [keys]: mockData[keys] };
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          if (key in mockData) {
            result[key] = mockData[key];
          }
        }
        return result;
      }
      // keys is Record<string, unknown>
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(keys)) {
        result[key] = key in mockData ? mockData[key] : keys[key];
      }
      return result;
    },
    set: async (items) => {
      Object.assign(mockData, items);
    },
    remove: async (keys) => {
      if (typeof keys === 'string') {
        delete mockData[keys];
      } else {
        for (const key of keys) {
          delete mockData[key];
        }
      }
    },
    clear: async () => {
      Object.keys(mockData).forEach((key) => delete mockData[key]);
    },
  };
  return storage;
}

// Check if Chrome storage is available
export function isChromeStorageAvailable(): boolean {
  return !!(
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.local
  );
}

// Get a single value from storage
export async function getValue<T>(key: string, defaultValue: T): Promise<T> {
  const storage = getStorageArea('local');
  const result = await storage.get(key) as Record<string, T>;
  return result[key] !== undefined ? result[key] : defaultValue;
}

// Get multiple values from storage
export async function getValues<T extends Record<string, unknown>>(
  keys: T
): Promise<{ [K in keyof T]: T[K] }> {
  const storage = getStorageArea('local');
  const result = await storage.get(Object.keys(keys)) as T;
  return result;
}

// Set a value in storage
export async function setValue<T>(key: string, value: T): Promise<void> {
  const storage = getStorageArea('local');
  await storage.set({ [key]: value });
}

// Set multiple values in storage
export async function setValues(items: Record<string, unknown>): Promise<void> {
  const storage = getStorageArea('local');
  await storage.set(items);
}

// Remove a value from storage
export async function removeValue(key: string): Promise<void> {
  const storage = getStorageArea('local');
  await storage.remove(key);
}

// Remove multiple values from storage
export async function removeValues(keys: string[]): Promise<void> {
  const storage = getStorageArea('local');
  await storage.remove(keys);
}

// Clear all values in storage
export function clearAll(): Promise<void> {
  const storage = getStorageArea('local');
  return storage.clear();
}

// Subscribe to storage changes
export function subscribe(
  key: string,
  callback: (newValue: unknown, oldValue: unknown) => void
): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return () => {};
  }

  const handleChange = (
    changes: Record<string, StorageChange>,
    area: string
  ) => {
    if (area === 'local' && changes[key]) {
      callback(changes[key].newValue, changes[key].oldValue);
    }
  };

  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
