import { useEffect, useState } from "react";
import type { DeepSeekConfig } from "../../types";
import { getDeepSeekConfig, saveDeepSeekConfig } from "../../utils/storage";

interface SidebarSettingsProps {
  onComplete: () => void;
  onBack: () => void;
}

export function SidebarSettings({ onComplete, onBack }: SidebarSettingsProps) {
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com/v1");
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
    if (!baseUrl.trim()) {
      setError("Please enter API Base URL");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter API Key");
      return;
    }
    try {
      new URL(baseUrl);
    } catch {
      setError("Please enter a valid API Base URL");
      return;
    }
    const maxTokensNum = parseInt(maxTokens, 10);
    if (isNaN(maxTokensNum) || maxTokensNum < 1 || maxTokensNum > 32000) {
      setError("maxTokens must be between 1 and 32000");
      return;
    }
    const tempNum = parseFloat(temperature);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
      setError("temperature must be between 0 and 2");
      return;
    }
    if (!promptTemplate.includes("{title}") || !promptTemplate.includes("{content}")) {
      setError("Prompt template must include {title} and {content} placeholders");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const config: DeepSeekConfig = {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: "deepseek-chat",
        maxTokens: maxTokensNum,
        temperature: tempNum,
        promptTemplate: promptTemplate.trim(),
      };
      await saveDeepSeekConfig(config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onComplete();
      }, 1000);
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
            placeholder="https://api.deepseek.com/v1"
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
              <p style={{ fontSize: "12px", color: "var(--sumpage-muted)", margin: "8px 0 0 0" }}>
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

        {error && (
          <div className="sumpage-error">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div
            style={{
              background: "var(--sumpage-success-soft)",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              textAlign: "center",
              color: "var(--sumpage-success)",
              border: "1px solid var(--sumpage-border)",
            }}
          >
            Settings saved!
          </div>
        )}

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
