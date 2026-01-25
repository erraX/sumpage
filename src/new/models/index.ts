/**
 * Data models for the application
 * Follows the schema defined in design/model.md
 */

// ============ Prompt Template ============

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  isDefault?: boolean; // Keep for backward compatibility
  createdAt: number;
  updatedAt: number;
}

export type PromptTemplateStore = PromptTemplate[];

// ============ Provider Config ============

export type ProviderType = 'openai' | 'anthropic' | 'deepseek' | 'minimax' | 'gemini';

export interface ProviderConfig {
  id: string;
  provider: ProviderType;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export type ProviderConfigStore = Record<ProviderType, ProviderConfig>;

// ============ Global Settings ============

export interface ToggleButtonPosition {
  bottom: number;
  right: number;
}

export interface GlobalSettings {
  providerId: string;
  promptTemplateId: string;
  toggleButtonPosition: ToggleButtonPosition;
}

// ============ Chat ============

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  timestamp: number;
}

export interface ChatHistoryRecord {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface ChatSession {
  id: string;
  pageUrl: string;
  history: string[]; // Array of ChatHistoryRecord ids
  createdAt: number;
  updatedAt: number;
}

export type ChatHistoryStore = Record<string, ChatSession>;

// ============ Summary ============

export interface AISummary {
  summary: string;
  keyPoints: string[];
}

export interface PageSummary {
  title: string;
  textContent: string;
  wordCount: number;
  summary: string;
  keyPoints: string[];
}

// ============ Message Types ============

export type BackgroundMessageType =
  | 'SUMMARIZE_WITH_DEEPSEEK'
  | 'CHAT_WITH_AI';

export interface BackgroundMessage {
  type: BackgroundMessageType;
  payload: {
    title: string;
    textContent: string;
    message?: string;
    history?: ChatMessage[];
    promptId?: string;
    promptTemplate?: string;
  };
}

// ============ Window Interface Extension ============

declare global {
  interface Window {
    sumpageInjected?: boolean;
  }
}
