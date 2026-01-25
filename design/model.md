## This is a model design

```ts
interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  createdAt: number;
  updatedAt: number;
}


interface ProviderConfig {
  id: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface GlobalSettingsStore {
  providerId: string;
  promptTemplateId: string;
  toggleButtonPosition: {
    bottom: number;
    right: number;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatHistoryRecord {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ChatSession {
  id: string;
  pageUrl: string;
  history: string[];
  createdAt: number;
  updatedAt: number;
}

type PromptTemplateStore = PromptTemplate[];
type ProviderConfigStore = ProviderConfig[];

interface ChatHistoryStore {
  [url: string]: ChatSession;
}

```

