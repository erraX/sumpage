import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for Chrome storage with caching
 * Follows Vercel's `js-cache-storage` best practice
 */
export function useChromeStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  // Load initial value from storage
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get(key) as Record<string, T>;
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      } catch {
        // Use default value on error
      }
    };

    loadValue();
  }, [key]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage) return;

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === "local" && changes[key]) {
        setStoredValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [key]);

  const setValue = useCallback(
    async (value: T) => {
      try {
        await chrome.storage.local.set({ [key]: value });
        setStoredValue(value);
      } catch (error) {
        console.error("Failed to set storage value:", error);
        throw error;
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
