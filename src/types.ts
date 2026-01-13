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
