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
  type: "SUMMARIZE_WITH_DEEPSEEK";
  payload: {
    title: string;
    textContent: string;
  };
}
