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
  createdAt: number;
  updatedAt: number;
}

export type PromptTemplateStore = PromptTemplate[];

// ============ Provider Config ============

export interface ProviderConfig {
  id: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export type ProviderConfigStore = ProviderConfig[];

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
