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
import {
  Content,
  Container,
  BackButton,
  TabsContainer,
  TabButton,
  FormGroup,
  Label,
  StyledInput,
  AdvancedButton,
  AdvancedSettings,
  GridRow,
  SuccessMessage,
  NewPromptButton,
  PromptList,
  PromptItem,
  PromptItemHead,
  PromptItemTitle,
  PromptItemActions,
  PromptItemButton,
  PromptTemplatePre,
  PromptEditForm,
  EditActions,
  SummarizeButton,
  RetryButton,
} from "./styles";

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
    <Content>
      <Container>
        <BackButton onClick={onBack}>
          Back
        </BackButton>

        {/* Tabs */}
        <TabsContainer>
          <TabButton
            $active={activeTab === "api"}
            onClick={() => setActiveTab("api")}
          >
            API Settings
          </TabButton>
          <TabButton
            $active={activeTab === "prompts"}
            onClick={() => setActiveTab("prompts")}
          >
            Prompts
          </TabButton>
        </TabsContainer>

        {activeTab === "api" && (
          <>
            <FormGroup>
              <Label>API Base URL</Label>
              <StyledInput
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                disabled={saving}
              />
            </FormGroup>

            <FormGroup>
              <Label>API Key</Label>
              <StyledInput
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                disabled={saving}
              />
            </FormGroup>

            <AdvancedButton onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "Hide" : "Show"} Advanced Settings
            </AdvancedButton>

            {showAdvanced && (
              <AdvancedSettings>
                <GridRow>
                  <FormGroup>
                    <Label>Max Tokens</Label>
                    <StyledInput
                      type="text"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(e.target.value)}
                      disabled={saving}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Temperature</Label>
                    <StyledInput
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      disabled={saving}
                    />
                  </FormGroup>
                </GridRow>
              </AdvancedSettings>
            )}

            {error && (
              <div style={{ marginBottom: "16px" }}>
                <div className="sumpage-error">
                  <p>{error}</p>
                </div>
              </div>
            )}
            {success && (
              <SuccessMessage>
                Settings saved!
              </SuccessMessage>
            )}

            <SummarizeButton onClick={handleSaveApi} disabled={saving}>
              {saving ? "Saving..." : "Save & Continue"}
            </SummarizeButton>
          </>
        )}

        {activeTab === "prompts" && (
          <>
            <NewPromptButton onClick={handleAddPrompt}>
              + New Prompt
            </NewPromptButton>

            <PromptList>
              {prompts.map((prompt) => (
                <PromptItem key={prompt.id}>
                  {editingPromptId === prompt.id ? (
                    // Edit mode
                    <PromptEditForm>
                      <StyledInput
                        type="text"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                        placeholder="Prompt name"
                      />
                      <textarea
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        rows={6}
                        placeholder="Prompt template with {title} and {content} placeholders"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d7e1dd",
                          borderRadius: "10px",
                          fontSize: "14px",
                          fontFamily: "inherit",
                          resize: "vertical",
                          background: "#fbfbfa",
                        }}
                      />
                      <EditActions>
                        <SummarizeButton onClick={() => handleUpdatePrompt(prompt.id)}>
                          Save
                        </SummarizeButton>
                        <RetryButton onClick={cancelEditing}>
                          Cancel
                        </RetryButton>
                      </EditActions>
                    </PromptEditForm>
                  ) : (
                    // View mode
                    <>
                      <PromptItemHead>
                        <PromptItemTitle $isDefault={prompt.isDefault}>
                          {prompt.name}
                        </PromptItemTitle>
                        <PromptItemActions>
                          {!prompt.isDefault && (
                            <PromptItemButton onClick={() => handleSetDefault(prompt.id)}>
                              Set Default
                            </PromptItemButton>
                          )}
                          <PromptItemButton onClick={() => startEditing(prompt)}>
                            Edit
                          </PromptItemButton>
                          {!prompt.isDefault && (
                            <PromptItemButton $danger onClick={() => handleDeletePrompt(prompt.id)}>
                              Delete
                            </PromptItemButton>
                          )}
                        </PromptItemActions>
                      </PromptItemHead>
                      <PromptTemplatePre>
                        {prompt.template}
                      </PromptTemplatePre>
                    </>
                  )}
                </PromptItem>
              ))}
            </PromptList>
          </>
        )}
      </Container>
    </Content>
  );
}
