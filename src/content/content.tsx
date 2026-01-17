import type { PageSummary, ContentScriptMessage } from "../types";

// Extract text content from the page
function extractPageContent(): { title: string; textContent: string; wordCount: number } {
  const title = document.title || "Untitled";

  // Get main content, prioritizing article/text content
  const textContent = document.body?.innerText || "";

  // Clean up the text
  const cleanedText = textContent
    .replace(/\s+/g, " ")
    .replace(/[\r\n]+/g, ". ")
    .trim();

  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

  return { title, textContent: cleanedText, wordCount };
}

// Simple extractive summarization - extracts key sentences
function generateSummary(text: string, wordCount: number): string {
  if (wordCount < 50) {
    return text;
  }

  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length === 0) {
    return text.substring(0, 500);
  }

  // Score sentences by position and length
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;

    // First and last sentences are important
    if (index === 0) score += 3;
    if (index === sentences.length - 1) score += 2;

    // Prefer medium-length sentences
    const wordLength = sentence.split(/\s+/).length;
    if (wordLength >= 10 && wordLength <= 30) score += 1;

    // Headings often contain important info
    if (sentence.toUpperCase() === sentence) score += 1;

    return { sentence, score, index };
  });

  // Sort by score and take top sentences
  scoredSentences.sort((a, b) => b.score - a.score);

  const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.3));
  const topSentences = scoredSentences
    .slice(0, summaryLength)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  return topSentences.join(" ");
}

// Extract key points from the content
function extractKeyPoints(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  // Take first sentence of each paragraph-like section
  const keyPoints = sentences
    .filter((sentence) => {
      const wordLength = sentence.split(/\s+/).length;
      return wordLength >= 5 && wordLength <= 25;
    })
    .slice(0, 5);

  return keyPoints;
}

// Create page summary
function createPageSummary(): PageSummary {
  const { title, textContent, wordCount } = extractPageContent();
  const summary = generateSummary(textContent, wordCount);
  const keyPoints = extractKeyPoints(textContent);

  return {
    title,
    textContent,
    wordCount,
    summary,
    keyPoints,
  };
}

// Listen for messages
chrome.runtime.onMessage.addListener(
  (message: ContentScriptMessage, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTENT") {
      const summary = createPageSummary();
      sendResponse({
        type: "PAGE_CONTENT_RESPONSE",
        payload: summary,
      });
      return true; // Keep channel open for async response
    }
    return false;
  }
);

// Import sidebar injection
import { injectSidebar } from "./sidebar-inject";

// Inject sidebar when content script loads
if (typeof window !== "undefined" && !window.sumpageInjected) {
  console.log("[Sumpage] Content script loaded, calling injectSidebar...");
  window.sumpageInjected = true;
  injectSidebar();
}

// Export for testing
export { extractPageContent, generateSummary, extractKeyPoints, createPageSummary };
