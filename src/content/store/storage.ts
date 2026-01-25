/**
 * Core storage primitives for Chrome storage abstraction
 */

// Type definitions for storage
interface StorageArea {
  get: (keys?: string | string[] | Record<string, unknown>) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string | string[]) => Promise<void>;
  clear: () => Promise<void>;
}

// Get the appropriate storage area
function getStorageArea(area: 'local' | 'sync' | 'managed' = 'local'): StorageArea {
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
      if (!keys) return mockData;
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
      return keys;
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

// Get a value from storage
export async function getStorageValue<T>(key: string, defaultValue: T): Promise<T> {
  const storage = getStorageArea('local');
  const result = await storage.get(key) as Record<string, T>;
  return result[key] !== undefined ? result[key] : defaultValue;
}

// Get multiple values from storage
export async function getStorageValues<T extends Record<string, unknown>>(
  keys: T
): Promise<{ [K in keyof T]: T[K] }> {
  const storage = getStorageArea('local');
  const result = await storage.get(Object.keys(keys)) as T;
  return result;
}

// Set a value in storage
export async function setStorageValue<T>(key: string, value: T): Promise<void> {
  const storage = getStorageArea('local');
  await storage.set({ [key]: value });
}

// Remove a value from storage
export async function removeStorageValue(key: string): Promise<void> {
  const storage = getStorageArea('local');
  await storage.remove(key);
}

// Clear all values in storage
export async function clearStorage(): Promise<void> {
  const storage = getStorageArea('local');
  await storage.clear();
}

// Subscribe to storage changes
export function subscribeToStorageChanges(
  key: string,
  callback: (newValue: unknown, oldValue: unknown) => void
): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return () => {};
  }

  const handleChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area === 'local' && changes[key]) {
      callback(changes[key].newValue, changes[key].oldValue);
    }
  };

  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}

// Export storage area for advanced use cases
export { getStorageArea };
