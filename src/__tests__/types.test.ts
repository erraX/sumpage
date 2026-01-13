import { describe, it, expect } from "vitest";
import type { PageSummary, SummarizeResponse, ContentScriptMessage } from "../types";

describe("Type Definitions", () => {
  it("should correctly type PageSummary", () => {
    const summary: PageSummary = {
      title: "Test Page",
      textContent: "This is the full text content.",
      wordCount: 5,
      summary: "This is the summary.",
      keyPoints: ["Point 1", "Point 2"],
    };

    expect(summary.title).toBe("Test Page");
    expect(summary.wordCount).toBe(5);
    expect(summary.keyPoints).toHaveLength(2);
  });

  it("should correctly type SummarizeResponse success", () => {
    const response: SummarizeResponse = {
      success: true,
      data: {
        title: "Test",
        textContent: "Content",
        wordCount: 1,
        summary: "Summary",
        keyPoints: [],
      },
    };

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });

  it("should correctly type SummarizeResponse error", () => {
    const response: SummarizeResponse = {
      success: false,
      error: "Failed to fetch content",
    };

    expect(response.success).toBe(false);
    expect(response.error).toBe("Failed to fetch content");
  });

  it("should correctly type ContentScriptMessage", () => {
    const getMessage: ContentScriptMessage = {
      type: "GET_PAGE_CONTENT",
    };

    expect(getMessage.type).toBe("GET_PAGE_CONTENT");

    const responseMessage: ContentScriptMessage = {
      type: "PAGE_CONTENT_RESPONSE",
      payload: { title: "Test" },
    };

    expect(responseMessage.type).toBe("PAGE_CONTENT_RESPONSE");
    expect(responseMessage.payload).toBeDefined();
  });
});
