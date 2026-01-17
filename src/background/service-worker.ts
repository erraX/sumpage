// Service worker for Sumpage extension

const MAX_CONTENT_LENGTH = 12000;

console.log("[Background] Service worker starting...");

interface AISummary {
  summary: string;
  keyPoints: string[];
}

interface BackgroundMessage {
  type: "SUMMARIZE_WITH_DEEPSEEK";
  payload: {
    title: string;
    textContent: string;
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

  console.log("[Background] Config found, baseUrl:", config.baseUrl);

  const truncatedContent = textContent.length > MAX_CONTENT_LENGTH
    ? textContent.substring(0, MAX_CONTENT_LENGTH) + "..."
    : textContent;

  const prompt = createPrompt(config.promptTemplate, title, truncatedContent);

  try {
    console.log("[Background] Calling DeepSeek API...");
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
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
        errorMessage = errorData.message || errorMessage;
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

// Set up message listener
chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  console.log("[Background] Message received:", message.type);
  if (message.type === "SUMMARIZE_WITH_DEEPSEEK") {
    handleDeepSeekSummarize(message.payload, sendResponse);
    return true; // Keep channel open for async response
  }
  return false;
});

console.log("[Background] Service worker ready");
