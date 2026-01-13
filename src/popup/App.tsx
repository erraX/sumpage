import { useState, useEffect } from "react";
import type { PageSummary } from "../types";
import "./index.css";

interface AppProps {
  initialSummary?: PageSummary | null;
}

export function App({ initialSummary }: AppProps) {
  const [summary, setSummary] = useState<PageSummary | null>(initialSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const summarizePage = async () => {
    setLoading(true);
    setError(null);

    try {
      // Query for the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      // Execute script to get page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This runs in the context of the page
          const title = document.title || "Untitled";
          const textContent = document.body?.innerText || "";
          const cleanedText = textContent.replace(/\s+/g, " ").replace(/[\r\n]+/g, ". ").trim();
          const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

          // Simple extractive summarization
          const sentences = cleanedText.split(/(?<=[.!?])\s+/).filter(Boolean);
          const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.3));
          const summary = sentences.slice(0, summaryLength).join(" ");

          const keyPoints = sentences
            .filter((s) => s.split(/\s+/).length >= 5 && s.split(/\s+/).length <= 25)
            .slice(0, 5);

          return {
            title,
            textContent: cleanedText,
            wordCount,
            summary,
            keyPoints,
          };
        },
      });

      if (results && results[0]?.result) {
        setSummary(results[0].result as PageSummary);
      } else {
        throw new Error("Failed to extract page content");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed, silently handle
    }
  };

  useEffect(() => {
    // Auto-summarize on mount if we have permission
    summarizePage();
  }, []);

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Sumpage</h1>
        <p className="subtitle">Page Content Summarizer</p>
      </header>

      <main className="popup-content">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Analyzing page content...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={summarizePage} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {summary && !loading && !error && (
          <div className="summary-result">
            <div className="summary-header">
              <h2>{summary.title}</h2>
              <span className="word-count">{summary.wordCount} words</span>
            </div>

            <section className="summary-section">
              <div className="section-header">
                <h3>Summary</h3>
                <button
                  onClick={() => copyToClipboard(summary.summary)}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="summary-text">{summary.summary}</p>
            </section>

            {summary.keyPoints.length > 0 && (
              <section className="summary-section">
                <h3>Key Points</h3>
                <ul className="key-points">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="actions">
              <button onClick={summarizePage} className="refresh-btn">
                Refresh
              </button>
            </div>
          </div>
        )}

        {!summary && !loading && !error && (
          <div className="empty-state">
            <p>Click the button below to summarize this page</p>
            <button onClick={summarizePage} className="summarize-btn">
              Summarize Page
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
