export interface DeepSeekConfig {
  baseUrl: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export const PROMPT_TEMPLATES_KEY = "promptTemplates";

export const DEFAULT_PROMPT_TEMPLATE: PromptTemplate = {
  id: "default",
  name: "Default Summary",
  template: `Please summarize the following webpage content:

Title: {title}

Content:
{content}

Please provide:
1. A concise summary (2-3 paragraphs)
2. 3-5 key points as bullet points

Format your response as:
## Summary
[your summary here]

## Key Points
- [key point 1]
- [key point 2]
- [key point 3]`,
  isDefault: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

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
    message?: string;
    history?: ChatMessage[];
    promptId?: string;
    promptTemplate?: string;
  };
}

// Window interface extension for global properties
declare global {
  interface Window {
    sumpageInjected?: boolean;
  }
}
