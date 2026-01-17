// Service worker for Sumpage extension

const MAX_CONTENT_LENGTH = 12000;

console.log("[Background] Service worker starting...");

interface AISummary {
  summary: string;
  keyPoints: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BackgroundMessage {
  type: "SUMMARIZE_WITH_DEEPSEEK" | "CHAT_WITH_AI";
  payload: {
    title: string;
    textContent: string;
    message?: string;
    history?: ChatMessage[];
  };
}

interface DeepSeekConfig {
  baseUrl: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  promptTemplate?: string;
}

async function getDeepSeekConfig(): Promise<DeepSeekConfig | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("deepseekConfig", (result) => {
      resolve(result.deepseekConfig || null);
    });
  });
}

async function handleDeepSeekSummarize(
  payload: { title: string; textContent: string },
  sendResponse: (response: { success: boolean; data?: AISummary; error?: string }) => void
) {
  const { title, textContent } = payload;
  console.log("[Background] Processing request for:", title);

  const config = await getDeepSeekConfig();
  if (!config) {
    console.error("[Background] No config found");
    sendResponse({ success: false, error: "API not configured" });
    return;
  }

  const apiBaseUrl = normalizeBaseUrl(config.baseUrl);
  console.log("[Background] Config found, baseUrl:", apiBaseUrl);

  const truncatedContent = textContent.length > MAX_CONTENT_LENGTH
    ? textContent.substring(0, MAX_CONTENT_LENGTH) + "..."
    : textContent;

  const prompt = createPrompt(config.promptTemplate, title, truncatedContent);

  try {
    console.log("[Background] Calling DeepSeek API...");
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
      }),
    });

    console.log("[Background] API response status:", response.status);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error?.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      console.error("[Background] API error:", errorMessage);
      sendResponse({ success: false, error: errorMessage });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log("[Background] Response content length:", content.length);

    const { summary, keyPoints } = parseAIResponse(content);

    console.log("[Background] Success, summary length:", summary.length);

    sendResponse({
      success: true,
      data: { summary, keyPoints },
    });
  } catch (err) {
    console.error("[Background] Network error:", err);
    sendResponse({
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    });
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/v1")) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}

function createPrompt(template: string | undefined, title: string, content: string): string {
  const defaultTemplate = `Please summarize the following webpage content:

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

  const promptTemplate = template || defaultTemplate;
  return promptTemplate
    .replace(/{title}/g, title)
    .replace(/{content}/g, content);
}

function parseAIResponse(content: string): { summary: string; keyPoints: string[] } {
  const summaryMatch = content.match(/## Summary\s*\n([\s\S]*?)(?=## Key Points|$)/i);
  const keyPointsMatch = content.match(/## Key Points\s*\n([\s\S]*)/i);

  const summary = summaryMatch
    ? summaryMatch[1].trim().replace(/\n+/g, " ")
    : content.substring(0, 500);

  const keyPoints = keyPointsMatch
    ? keyPointsMatch[1].trim().split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return { summary, keyPoints };
}

async function handleChatWithAI(
  payload: { title: string; textContent: string; message: string; history: ChatMessage[] },
  sendResponse: (response: { success: boolean; message?: ChatMessage; error?: string }) => void
) {
  const { title, textContent, message, history } = payload;

  const config = await getDeepSeekConfig();
  if (!config) {
    sendResponse({ success: false, error: "API not configured" });
    return;
  }

  const apiBaseUrl = normalizeBaseUrl(config.baseUrl);

  const truncatedContent = textContent.length > MAX_CONTENT_LENGTH
    ? textContent.substring(0, MAX_CONTENT_LENGTH) + "..."
    : textContent;

  // Build messages array with system context and history
  const messages: { role: string; content: string }[] = [
    {
      role: "system",
      content: `You are analyzing a webpage titled "${title}". ${truncatedContent.substring(0, 500)}...`,
    },
  ];

  // Add history messages (excluding system message)
  if (history) {
    messages.push(...history.map((m) => ({ role: m.role, content: m.content })));
  }

  // Add current user message
  messages.push({ role: "user", content: message });

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "deepseek-chat",
        messages,
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error?.message || errorMessage;
      } catch {}
      sendResponse({ success: false, error: errorMessage });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    sendResponse({
      success: true,
      message: { role: "assistant", content },
    });
  } catch (err) {
    sendResponse({
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    });
  }
}

// Set up message listener
chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  console.log("[Background] Message received:", message.type);
  if (message.type === "SUMMARIZE_WITH_DEEPSEEK") {
    handleDeepSeekSummarize(message.payload, sendResponse);
    return true; // Keep channel open for async response
  }
  if (message.type === "CHAT_WITH_AI") {
    handleChatWithAI(message.payload as any, sendResponse);
    return true; // Keep channel open for async response
  }
  return false;
});

console.log("[Background] Service worker ready");
