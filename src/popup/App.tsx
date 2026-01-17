import { useState, useEffect, useCallback } from "react";
import type { PageSummary, AISummary } from "../types";
import { Settings } from "./Settings";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { getDeepSeekConfig } from "../utils/storage";
import "./index.css";

interface AppProps {
  initialSummary?: PageSummary | null;
}

type LoadingStep = "idle" | "extracting" | "connecting" | "complete";

export function App({ initialSummary }: AppProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(initialSummary ? {
    summary: initialSummary.summary,
    keyPoints: initialSummary.keyPoints
  } : null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    const config = await getDeepSeekConfig();
    setShowSettings(!config);
  };

  const extractPageContent = useCallback(async (): Promise<{ title: string; textContent: string } | null> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setError("No active tab found");
      return null;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.title || "Untitled";
        const textContent = document.body?.innerText || "";
        const cleanedText = textContent.replace(/\s+/g, " ").replace(/[\r\n]+/g, ". ").trim();
        return { title, textContent: cleanedText };
      },
    });

    if (!results || !results[0]?.result) {
      setError("Failed to extract page content");
      return null;
    }

    return results[0].result as { title: string; textContent: string };
  }, []);

  const summarizeWithAI = useCallback(async () => {
    const content = await extractPageContent();
    if (!content) return;

    setLoading(true);
    setLoadingStep("extracting");
    setError(null);

    try {
      setLoadingStep("connecting");

      // Check if background page is available
      if (!chrome.runtime?.id) {
        throw new Error("Extension context invalidated");
      }

      console.log("[Sumpage] Sending message to background...");

      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_WITH_DEEPSEEK",
        payload: content,
      });

      console.log("[Sumpage] Response received:", response);

      if (response.success && response.data) {
        setAiSummary(response.data);
        setLoadingStep("complete");
      } else {
        setError(response.error || "Failed to generate summary");
        setLoadingStep("idle");
      }
    } catch (err: any) {
      console.error("[Sumpage] Error:", err);
      if (err.message?.includes("Extension context invalidated")) {
        setError("Extension reloaded. Please close and reopen the popup.");
      } else if (err.message?.includes("receivers") || err.message?.includes("no receivers")) {
        setError("Background service worker not responding. Check chrome://extensions/");
      } else {
        setError(err.message || "An error occurred");
      }
      setLoadingStep("idle");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep("idle");
      }, 1000);
    }
  }, [extractPageContent]);

  if (showSettings) {
    return <Settings onComplete={() => checkConfiguration()} />;
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Sumpage</h1>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 7.89l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
          </svg>
        </button>
      </header>

      <main className="popup-content">
        {loading && (
          <div className={`loading ${loadingStep === "complete" ? "success" : ""}`}>
            <div className="loading-icon">
              <div className="spinner" />
            </div>
            <p>
              {loadingStep === "extracting" && "Extracting page content..."}
              {loadingStep === "connecting" && "Connecting to DeepSeek API..."}
              {loadingStep === "complete" && "Summary generated!"}
            </p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={summarizeWithAI} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {aiSummary && !loading && !error && (
          <div className="summary-result">
            <div className="ai-badge">AI Generated</div>

            <section className="markdown-section">
              <MarkdownRenderer content={aiSummary.summary} />
            </section>

            {aiSummary.keyPoints.length > 0 && (
              <section className="markdown-section">
                <h3>Key Points</h3>
                <ul className="key-points">
                  {aiSummary.keyPoints.map((point, index) => (
                    <li key={index}>
                      <MarkdownRenderer content={point} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="actions">
              <button onClick={summarizeWithAI} className="refresh-btn">
                Regenerate
              </button>
            </div>
          </div>
        )}

        {!aiSummary && !loading && !error && (
          <div className="empty-state">
            <p>Click the button below to summarize this page with AI</p>
            <button onClick={summarizeWithAI} className="summarize-btn">
              Summarize Page
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
