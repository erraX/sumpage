import type { ChatMessage } from "../../types";

function isChromeStorageAvailable(): boolean {
  return !!(
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local
  );
}

export async function getChatHistory(url: string): Promise<ChatMessage[] | null> {
  if (!isChromeStorageAvailable()) {
    return null;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      resolve(history[url]?.messages || null);
    });
  });
}

export async function saveChatHistory(
  url: string,
  title: string,
  messages: ChatMessage[]
): Promise<void> {
  if (!isChromeStorageAvailable()) {
    throw new Error("Chrome storage is not available");
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      history[url] = {
        url,
        title,
        messages,
        lastUpdated: Date.now(),
      };
      chrome.storage.local.set({ chatHistory: history }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

export async function clearChatHistory(url: string): Promise<void> {
  if (!isChromeStorageAvailable()) {
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get("chatHistory", (result: any) => {
      const history = result.chatHistory || {};
      delete history[url];
      chrome.storage.local.set({ chatHistory: history }, () => {
        resolve();
      });
    });
  });
}
