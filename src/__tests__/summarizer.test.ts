import { describe, it, expect, vi } from "vitest";

// Mock the chrome API for tests
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

vi.stubGlobal("chrome", mockChrome);

// Import after mocking
const { extractPageContent, generateSummary, extractKeyPoints } = await import(
  "../content/content"
);

describe("extractPageContent", () => {
  it("should extract title from document", () => {
    // Mock document.title
    Object.defineProperty(document, "title", {
      value: "Test Page Title",
      configurable: true,
    });

    const result = extractPageContent();
    expect(result.title).toBe("Test Page Title");
  });

  it("should handle missing title gracefully", () => {
    Object.defineProperty(document, "title", {
      value: "",
      configurable: true,
    });

    const result = extractPageContent();
    expect(result.title).toBe("Untitled");
  });
});

describe("generateSummary", () => {
  it("should return original text for short content", () => {
    const shortText = "This is a short paragraph.";
    const result = generateSummary(shortText, 5);
    expect(result).toBe(shortText);
  });

  it("should extract key sentences from long content", () => {
    const longText =
      "First sentence is important. This is the second sentence. " +
      "Third sentence with some details. Another sentence here. " +
      "Final important sentence.";
    const result = generateSummary(longText, 25);
    expect(result).toBeTruthy();
    expect(result.length).toBeLessThanOrEqual(longText.length);
  });
});

describe("extractKeyPoints", () => {
  it("should return empty array for empty text", () => {
    const result = extractKeyPoints("");
    expect(result).toEqual([]);
  });

  it("should filter sentences by appropriate length", () => {
    const text =
      "Short. This is a good length key point sentence for extraction. " +
      "Very long sentence that goes on and on and contains too many words to be considered a key point.";
    const result = extractKeyPoints(text);

    expect(result.some((p) => p.includes("good length key point"))).toBe(true);
  });

  it("should limit key points to 5", () => {
    const sentences = Array.from({ length: 10 }, (_, i) =>
      `This is key point number ${i + 1} with enough words to be valid.`
    );
    const text = sentences.join(" ");
    const result = extractKeyPoints(text);

    expect(result.length).toBeLessThanOrEqual(5);
  });
});
