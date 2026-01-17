import { useState, useEffect } from "react";
import type { DeepSeekConfig } from "../types";
import { getDeepSeekConfig, saveDeepSeekConfig } from "../utils/storage";

interface SettingsProps {
  onComplete: () => void;
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

export function Settings({ onComplete }: SettingsProps) {
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
        if (config.promptTemplate) {
          setPromptTemplate(config.promptTemplate);
        }
        if (config.maxTokens) {
          setMaxTokens(String(config.maxTokens));
        }
        if (config.temperature) {
          setTemperature(String(config.temperature));
        }
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
      if (err instanceof Error && err.message === "Chrome storage is not available") {
        setError("Chrome storage is not available. Please reload the extension.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = () => {
    setPromptTemplate(DEFAULT_PROMPT);
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Configure DeepSeek API</p>
      </header>

      <main className="settings-content">
        <div className="form-group">
          <label htmlFor="baseUrl">API Base URL</label>
          <input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com"
            disabled={saving}
          />
          <span className="input-hint">The base URL for the DeepSeek API</span>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={saving}
          />
          <span className="input-hint">Your DeepSeek API key</span>
        </div>

        <div className="advanced-toggle">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="advanced-btn"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
            <span className="arrow">{showAdvanced ? " ▲" : " ▼"}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-section">
            <div className="form-group">
              <label htmlFor="promptTemplate">Prompt Template</label>
              <textarea
                id="promptTemplate"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                disabled={saving}
                rows={10}
                placeholder="Enter your custom prompt template..."
              />
              <span className="input-hint">
                Available placeholders: {"{title}"} - page title, {"{content}"} - page content
              </span>
              <button
                type="button"
                onClick={handleResetPrompt}
                className="reset-btn"
                disabled={saving}
              >
                Reset to Default
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maxTokens">Max Tokens</label>
                <input
                  id="maxTokens"
                  type="text"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="temperature">Temperature</label>
                <input
                  id="temperature"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        )}

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">Settings saved!</div>}

        <div className="settings-actions">
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>

        <div className="settings-footer">
          <a
            href="https://platform.deepseek.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get API Key
          </a>
        </div>
      </main>
    </div>
  );
}
