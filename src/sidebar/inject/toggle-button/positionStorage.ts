import type { Position } from '../types';

const STORAGE_KEY = 'sumpageButtonPos';

export function loadPosition(): Promise<Position | null> {
  return new Promise((resolve) => {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get(STORAGE_KEY, (result: Record<string, unknown>) => {
        const pos = result[STORAGE_KEY];
        if (
          pos &&
          typeof pos === 'object' &&
          'right' in pos &&
          'bottom' in pos &&
          typeof (pos as Position).right === 'number' &&
          typeof (pos as Position).bottom === 'number'
        ) {
          resolve({ right: (pos as Position).right, bottom: (pos as Position).bottom });
        } else {
          resolve(null);
        }
      });
    } else {
      resolve(null);
    }
  });
}

export function savePosition(pos: Position): void {
  if (
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.local
  ) {
    chrome.storage.local.set({ [STORAGE_KEY]: pos });
  }
}
