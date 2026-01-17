export interface DeepSeekConfig {
  baseUrl: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  promptTemplate?: string;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export interface PageSummary {
  title: string;
  textContent: string;
  wordCount: number;
  summary: string;
  keyPoints: string[];
}

export interface SummarizeResponse {
  success: boolean;
  data?: PageSummary;
  error?: string;
}

export interface ContentScriptMessage {
  type: "GET_PAGE_CONTENT" | "PAGE_CONTENT_RESPONSE";
  payload?: unknown;
}

export interface BackgroundMessage {
  type: "SUMMARIZE_WITH_DEEPSEEK" | "CHAT_WITH_AI";
  payload: {
    title: string;
    textContent: string;
    message: string;
    history?: ChatMessage[];
  };
}

// Window interface extension for global properties
declare global {
  interface Window {
    sumpageInjected?: boolean;
  }
}
