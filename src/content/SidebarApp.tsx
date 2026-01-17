import { useState, useEffect, useCallback } from "react";
import type { AISummary } from "../types";

interface SidebarAppProps {
  onClose: () => void;
}

type LoadingStep = "idle" | "extracting" | "connecting" | "complete";

export function SidebarApp({ onClose }: SidebarAppProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
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
    const title = document.title || "Untitled";
    const textContent = document.body?.innerText || "";
    const cleanedText = textContent.replace(/\s+/g, " ").replace(/[\r\n]+/g, ". ").trim();
    return { title, textContent: cleanedText };
  }, []);

  const summarizeWithAI = useCallback(async () => {
    const content = await extractPageContent();
    if (!content) return;

    setLoading(true);
    setLoadingStep("extracting");
    setError(null);

    try {
      setLoadingStep("connecting");

      if (!chrome.runtime?.id) {
        throw new Error("Extension context invalidated");
      }

      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_WITH_DEEPSEEK",
        payload: content,
      });

      if (response.success && response.data) {
        setAiSummary(response.data);
        setLoadingStep("complete");
      } else {
        setError(response.error || "Failed to generate summary");
        setLoadingStep("idle");
      }
    } catch (err: any) {
      if (err.message?.includes("Extension context invalidated")) {
        setError("Extension reloaded. Please close and reopen.");
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

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for sidebar
    const html = content
      .replace(/##\s+(.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<)/g, '<p>')
      .replace(/(?!>)$/g, '</p>');
    return html;
  };

  if (showSettings) {
    return (
      <div className="sumpage-sidebar-host">
        <div className="sumpage-sidebar-panel sumpage-open">
          <div className="sumpage-sidebar-header">
            <h2 className="sumpage-sidebar-title">Settings</h2>
            <button className="sumpage-close-btn" onClick={onClose}>
              <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
            </button>
          </div>
          <SidebarSettings onComplete={() => checkConfiguration()} onBack={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="sumpage-sidebar-host">
      <div className="sumpage-sidebar-panel sumpage-open">
        <div className="sumpage-sidebar-header">
          <h2 className="sumpage-sidebar-title">Sumpage</h2>
          <button className="sumpage-close-btn" onClick={onClose}>
            <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
          </button>
        </div>
        <div className="sumpage-sidebar-content">
          <div className="sumpage-container">
            {loading && (
              <div className={`sumpage-loading ${loadingStep === "complete" ? "success" : ""}`}>
                <div className="sumpage-loading-icon">
                  <div className="sumpage-spinner" />
                </div>
                <p>
                  {loadingStep === "extracting" && "Extracting page content..."}
                  {loadingStep === "connecting" && "Connecting to DeepSeek API..."}
                  {loadingStep === "complete" && "Summary generated!"}
                </p>
              </div>
            )}

            {error && (
              <div className="sumpage-error">
                <p>{error}</p>
                <button className="sumpage-retry-btn" onClick={summarizeWithAI}>
                  Retry
                </button>
              </div>
            )}

            {aiSummary && !loading && !error && (
              <div className="sumpage-result">
                <div className="sumpage-ai-badge">AI Generated</div>
                <div
                  className="sumpage-markdown-section sumpage-markdown-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(aiSummary.summary) }}
                />
                {aiSummary.keyPoints.length > 0 && (
                  <div className="sumpage-markdown-section">
                    <h3>Key Points</h3>
                    <ul className="sumpage-key-points">
                      {aiSummary.keyPoints.map((point, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdown(point) }} />
                      ))}
                    </ul>
                  </div>
                )}
                <div className="sumpage-actions">
                  <button className="sumpage-refresh-btn" onClick={summarizeWithAI}>
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {!aiSummary && !loading && !error && (
              <div className="sumpage-empty">
                <p>Click the button below to summarize this page with AI</p>
                <button className="sumpage-summarize-btn" onClick={summarizeWithAI}>
                  Summarize Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Settings component for sidebar
function SidebarSettings({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [apiKey, setApiKey] = useState("");
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);
  const [maxTokens, setMaxTokens] = useState("4000");
  const [temperature, setTemperature] = useState("0.7");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDeepSeekConfig().then((config) => {
      if (config) {
        setBaseUrl(config.baseUrl);
        setApiKey(config.apiKey);
        if (config.promptTemplate) setPromptTemplate(config.promptTemplate);
        if (config.maxTokens) setMaxTokens(String(config.maxTokens));
        if (config.temperature) setTemperature(String(config.temperature));
      }
    });
  }, []);

  const handleSave = async () => {
    if (!baseUrl.trim()) { setError("Please enter API Base URL"); return; }
    if (!apiKey.trim()) { setError("Please enter API Key"); return; }
    try { new URL(baseUrl); } catch { setError("Please enter a valid API Base URL"); return; }
    const maxTokensNum = parseInt(maxTokens, 10);
    if (isNaN(maxTokensNum) || maxTokensNum < 1 || maxTokensNum > 32000) {
      setError("maxTokens must be between 1 and 32000"); return;
    }
    const tempNum = parseFloat(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
      setError("temperature must be between 0 and 2"); return;
    }
    if (!promptTemplate.includes("{title}") || !promptTemplate.includes("{content}")) {
      setError("Prompt template must include {title} and {content} placeholders"); return;
    }

    setSaving(true);
    setError(null);

    try {
      const config = {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: "deepseek-chat",
        maxTokens: maxTokensNum,
        temperature: tempNum,
        promptTemplate: promptTemplate.trim(),
      };
      await saveDeepSeekConfig(config);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onComplete(); }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = () => setPromptTemplate(DEFAULT_PROMPT);

  return (
    <div className="sumpage-sidebar-content">
      <div className="sumpage-container">
        <button className="sumpage-retry-btn" onClick={onBack} style={{ marginBottom: "16px" }}>
          Back
        </button>

        <div className="sumpage-form-group">
          <label className="sumpage-label">API Base URL</label>
          <input
            className="sumpage-input"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com"
            disabled={saving}
          />
        </div>

        <div className="sumpage-form-group">
          <label className="sumpage-label">API Key</label>
          <input
            className="sumpage-input"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={saving}
          />
        </div>

        <button
          className="sumpage-refresh-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ marginBottom: "16px" }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {showAdvanced && (
          <div style={{ marginBottom: "16px" }}>
            <div className="sumpage-form-group">
              <label className="sumpage-label">Prompt Template</label>
              <textarea
                className="sumpage-textarea"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                disabled={saving}
                rows={8}
              />
              <p style={{ fontSize: "12px", color: "#718096", margin: "8px 0 0 0" }}>
                Placeholders: {"{title}"} - page title, {"{content}"} - page content
              </p>
              <button className="sumpage-retry-btn" onClick={handleResetPrompt} style={{ marginTop: "8px" }}>
                Reset to Default
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="sumpage-form-group">
                <label className="sumpage-label">Max Tokens</label>
                <input
                  className="sumpage-input"
                  type="text"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="sumpage-form-group">
                <label className="sumpage-label">Temperature</label>
                <input
                  className="sumpage-input"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        )}

        {error && <div className="sumpage-error"><p>{error}</p></div>}
        {success && <div style={{ background: "#c6f6d5", padding: "12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center", color: "#276749" }}>Settings saved!</div>}

        <button className="sumpage-summarize-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_PROMPT = `Please summarize the following webpage content:

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
- [key point 3]`;

// Inline storage functions for sidebar
async function getDeepSeekConfig(): Promise<any | null> {
  if (!chrome.storage) return null;
  const result = await chrome.storage.local.get("deepseekConfig");
  return result.deepseekConfig || null;
}

async function saveDeepSeekConfig(config: any): Promise<void> {
  if (!chrome.storage) throw new Error("Chrome storage is not available");
  await chrome.storage.local.set({ deepseekConfig: config });
}
