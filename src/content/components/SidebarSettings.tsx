import { useEffect, useState } from "react";
import type { DeepSeekConfig, PromptTemplate } from "../../types";
import {
  getDeepSeekConfig,
  saveDeepSeekConfig,
  getPromptTemplates,
  addPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  setDefaultPromptTemplate,
  initializePromptTemplates,
} from "../../utils/storage";
import { DEFAULT_PROMPT_TEMPLATE } from "../../types";

interface SidebarSettingsProps {
  onComplete: () => void;
  onBack: () => void;
}

type SettingsTab = "api" | "prompts";

export function SidebarSettings({ onComplete, onBack }: SidebarSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("api");

  // API config state
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState("4000");
  const [temperature, setTemperature] = useState("0.7");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Prompts state
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptName, setPromptName] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");

  useEffect(() => {
    loadConfig();
    loadPrompts();
  }, []);

  const loadConfig = async () => {
    const config = await getDeepSeekConfig();
    if (config) {
      setBaseUrl(config.baseUrl);
      setApiKey(config.apiKey);
      if (config.maxTokens) setMaxTokens(String(config.maxTokens));
      if (config.temperature) setTemperature(String(config.temperature));
    }
  };

  const loadPrompts = async () => {
    await initializePromptTemplates(DEFAULT_PROMPT_TEMPLATE);
    const templates = await getPromptTemplates();
    setPrompts(templates);
  };

  const handleSaveApi = async () => {
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

    setSaving(true);
    setError(null);

    try {
      const config: DeepSeekConfig = {
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: "deepseek-chat",
        maxTokens: maxTokensNum,
        temperature: tempNum,
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

  const handleAddPrompt = async () => {
    const newPrompt = await addPromptTemplate({
      name: "New Prompt",
      template: "Please summarize this page:\n\nTitle: {title}\n\nContent:\n{content}",
      isDefault: false,
    });
    setPrompts([...prompts, newPrompt]);
    setEditingPromptId(newPrompt.id);
    setPromptName(newPrompt.name);
    setPromptTemplate(newPrompt.template);
  };

  const handleUpdatePrompt = async (id: string) => {
    if (!promptName.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!promptTemplate.includes("{title}") || !promptTemplate.includes("{content}")) {
      alert("Template must include {title} and {content} placeholders");
      return;
    }
    const updated = await updatePromptTemplate(id, {
      name: promptName.trim(),
      template: promptTemplate.trim(),
    });
    if (updated) {
      setPrompts(prompts.map((p) => (p.id === id ? updated : p)));
      setEditingPromptId(null);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt?.isDefault) {
      alert("Cannot delete the default prompt");
      return;
    }
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    const success = await deletePromptTemplate(id);
    if (success) {
      setPrompts(prompts.filter((p) => p.id !== id));
      if (editingPromptId === id) {
        setEditingPromptId(null);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPromptTemplate(id);
    setPrompts(prompts.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  const startEditing = (prompt: PromptTemplate) => {
    setEditingPromptId(prompt.id);
    setPromptName(prompt.name);
    setPromptTemplate(prompt.template);
  };

  const cancelEditing = () => {
    setEditingPromptId(null);
    setPromptName("");
    setPromptTemplate("");
  };

  return (
    <div className="sumpage-sidebar-content">
      <div className="sumpage-container">
        <button className="sumpage-retry-btn" onClick={onBack} style={{ marginBottom: "16px" }}>
          Back
        </button>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            className={`sumpage-summarize-btn ${activeTab === "api" ? "" : "sumpage-secondary"}`}
            onClick={() => setActiveTab("api")}
            style={{ flex: 1 }}
          >
            API Settings
          </button>
          <button
            className={`sumpage-summarize-btn ${activeTab === "prompts" ? "" : "sumpage-secondary"}`}
            onClick={() => setActiveTab("prompts")}
            style={{ flex: 1 }}
          >
            Prompts
          </button>
        </div>

        {activeTab === "api" && (
          <>
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

            <button className="sumpage-summarize-btn" onClick={handleSaveApi} disabled={saving}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </>
        )}

        {activeTab === "prompts" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <button className="sumpage-summarize-btn" onClick={handleAddPrompt}>
                + New Prompt
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  style={{
                    border: "1px solid var(--sumpage-border)",
                    borderRadius: "8px",
                    padding: "12px",
                    background: "var(--sumpage-surface)",
                  }}
                >
                  {editingPromptId === prompt.id ? (
                    // Edit mode
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        className="sumpage-input"
                        type="text"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                        placeholder="Prompt name"
                      />
                      <textarea
                        className="sumpage-textarea"
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        rows={6}
                        placeholder="Prompt template with {title} and {content} placeholders"
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="sumpage-summarize-btn" onClick={() => handleUpdatePrompt(prompt.id)}>
                          Save
                        </button>
                        <button className="sumpage-retry-btn" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 600 }}>
                          {prompt.name}
                          {prompt.isDefault && (
                            <span
                              style={{
                                fontSize: "11px",
                                marginLeft: "8px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "var(--sumpage-accent-soft)",
                                color: "var(--sumpage-accent)",
                              }}
                            >
                              Default
                            </span>
                          )}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {!prompt.isDefault && (
                            <button
                              className="sumpage-retry-btn"
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                              onClick={() => handleSetDefault(prompt.id)}
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            className="sumpage-retry-btn"
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            onClick={() => startEditing(prompt)}
                          >
                            Edit
                          </button>
                          {!prompt.isDefault && (
                            <button
                              className="sumpage-retry-btn"
                              style={{ fontSize: "11px", padding: "4px 8px", color: "var(--sumpage-error)" }}
                              onClick={() => handleDeletePrompt(prompt.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <pre
                        style={{
                          fontSize: "11px",
                          margin: 0,
                          padding: "8px",
                          background: "var(--sumpage-bg)",
                          borderRadius: "4px",
                          overflow: "auto",
                          maxHeight: "100px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {prompt.template}
                      </pre>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
