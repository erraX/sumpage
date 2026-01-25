import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarSettings } from './components/SidebarSettings';
import { LoadingStatus } from './components/LoadingStatus';
import { ErrorNotice } from './components/ErrorNotice';
import { ChatView } from './components/ChatView';
import { SummaryView } from './components/SummaryView';
import { EmptyState } from './components/EmptyState';
import { renderInlineMarkdown, renderMarkdown } from './utils/markdown';
import { Host, Panel, Container, Content } from './components/styles';
import { useUIStore } from './stores/uiStore';
import { useChatSession, usePromptTemplates, useProviderConfigs } from '../new/stores';
import type { ChatMessage, PromptTemplate, AISummary } from '../new/models';

interface SidebarAppProps {
  onClose: () => void;
}

// Static JSX extracted outside component (Vercel `rendering-hoist-jsx`)
const SettingsView = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => (
  <>
    <SidebarHeader title='Settings' onClose={onComplete} />
    <SidebarSettings onComplete={onComplete} onBack={onBack} />
  </>
);

const MainView = ({
  title,
  onClose,
  showNewChat,
  onNewChat,
}: {
  title: string;
  onClose: () => void;
  showNewChat: boolean;
  onNewChat: () => void;
}) => (
  <SidebarHeader title={title} onClose={onClose} showNewChat={showNewChat} onNewChat={onNewChat} />
);

const DEFAULT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'default',
  name: 'Default Summary',
  template: `Please summarize the following webpage content:

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
- [key point 3]`,
  isDefault: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function SidebarApp({ onClose }: SidebarAppProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand stores
  const {
    messages,
    isLoading: chatLoading,
    loadChatHistory,
    clearChat,
    setMessages,
  } = useChatSession();
  const {
    templates,
    selectedPromptId,
    selectTemplate,
    initialize: initTemplates,
  } = usePromptTemplates();
  const { checkConfiguration } = useProviderConfigs();
  const {
    isLoading,
    loadingStep,
    error,
    setError,
    setShowSettings: setShowSettingsStore,
    setIsLoading,
    setLoadingStep,
    showSettings,
  } = useUIStore();

  // Derived state for selected prompt name
  const selectedPromptName = (() => {
    if (selectedPromptId) {
      const prompt = templates.find((t) => t.id === selectedPromptId);
      if (prompt) return prompt.name;
    }
    const defaultPrompt = templates.find((t) => t.isDefault);
    return defaultPrompt?.name || '';
  })();

  const hasChat = messages.length > 0;

  // Get AI summary from first assistant message
  const aiSummary: AISummary | null = (() => {
    const firstAssistant = messages.find((m) => m.role === 'assistant');
    return firstAssistant ? { summary: firstAssistant.content, keyPoints: [] } : null;
  })();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await initTemplates(DEFAULT_PROMPT_TEMPLATE);
      const configured = await checkConfiguration();

      // Auto-select default template if none selected
      if (!selectedPromptId) {
        const defaultPrompt = templates.find((t) => t.isDefault);
        if (defaultPrompt) {
          await selectTemplate(defaultPrompt.id);
        }
      }

      // Close settings if configured
      if (configured && showSettings) {
        setShowSettingsStore(false);
      }
    };
    init();
  }, [
    initTemplates,
    checkConfiguration,
    selectTemplate,
    selectedPromptId,
    templates,
    showSettings,
    setShowSettingsStore,
  ]);

  // Load chat history when page URL changes
  useEffect(() => {
    const url = window.location.href;
    loadChatHistory(url);
  }, [loadChatHistory]);

  // Event handlers (memoized)
  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    const url = window.location.href;
    const currentMessages = useChatSession.getState().messages;

    if (currentMessages.length === 0) return;

    const lastMessage = currentMessages[currentMessages.length - 1];
    if (lastMessage.role !== 'user') return;

    const textContent = document.body?.innerText || '';
    const cleanedText = textContent
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, '. ')
      .trim();

    setIsLoading(true);
    setLoadingStep('connecting');
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHAT_WITH_AI',
        payload: {
          title: document.title || 'Untitled',
          textContent: cleanedText,
          message: lastMessage.content,
          history: currentMessages,
        },
      });

      if (response.success && response.message) {
        const newMessages = [...currentMessages, response.message];
        setMessages(newMessages);

        // Save to storage
        const title = document.title || 'Untitled';
        await import('../new/storages/chatHistoryStorage').then((s) =>
          s.saveChatHistory(url, title, newMessages)
        );
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setLoadingStep('idle');
    }
  }, [setError, setIsLoading, setLoadingStep, setMessages]);

  const startNewChat = useCallback(() => {
    const url = window.location.href;
    clearChat(url);
    setError(null);
  }, [clearChat, setError]);

  const handleSendPrompt = useCallback(
    async (promptTemplate: string, promptId: string) => {
      // Get the template content - either provided or from the selected template
      const templateContent =
        promptTemplate || templates.find((t) => t.id === promptId)?.template || '';
      await selectTemplate(promptId);

      // Generate summary
      const url = window.location.href;
      const textContent = document.body?.innerText || '';
      const cleanedText = textContent
        .replace(/\s+/g, ' ')
        .replace(/[\r\n]+/g, '. ')
        .trim();

      setIsLoading(true);
      setLoadingStep('extracting');
      setError(null);

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'SUMMARIZE_WITH_DEEPSEEK',
          payload: {
            title: document.title || 'Untitled',
            textContent: cleanedText,
            promptId,
            promptTemplate: templateContent,
          },
        });

        if (response.success && response.data) {
          const initialMessages: ChatMessage[] = [
            { role: 'assistant', content: response.data.summary, timestamp: Date.now() },
          ];
          setMessages(initialMessages);

          // Save to storage
          const title = document.title || 'Untitled';
          await import('../new/storages/chatHistoryStorage').then((s) =>
            s.saveChatHistory(url, title, initialMessages)
          );
          setLoadingStep('complete');
        } else {
          setError(response.error || 'Failed to generate summary');
          setLoadingStep('idle');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoadingStep('idle');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('idle');
        }, 1000);
      }
    },
    [selectTemplate, templates, setError, setIsLoading, setLoadingStep, setMessages]
  );

  const handleSettingsComplete = useCallback(async () => {
    const configured = await checkConfiguration();
    if (configured) {
      setShowSettingsStore(false);
    }
  }, [checkConfiguration, setShowSettingsStore]);

  // Show settings view
  if (showSettings) {
    return (
      <Host>
        <Panel>
          <SettingsView
            onComplete={handleSettingsComplete}
            onBack={() => setShowSettingsStore(false)}
          />
        </Panel>
      </Host>
    );
  }

  // Main content view
  return (
    <Host>
      <Panel>
        <Content>
          <Container>
            {/* Loading State */}
            {isLoading && <LoadingStatus step={loadingStep} />}

            {/* Error State */}
            {error && (
              <ErrorNotice
                message={error}
                onRetry={
                  aiSummary
                    ? () => {
                        handleSendMessage();
                      }
                    : () => {}
                }
              />
            )}

            {/* Chat Messages */}
            {messages.length > 0 && !isLoading && (
              <ChatView
                messages={messages}
                loading={chatLoading}
                inputValue=''
                onInputChange={() => {}}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                renderMarkdown={renderMarkdown}
                messagesEndRef={messagesEndRef}
                selectedPromptName={selectedPromptName}
              />
            )}

            {/* Initial Summary View */}
            {aiSummary && messages.length === 0 && !isLoading && !error && (
              <SummaryView
                summary={aiSummary.summary}
                keyPoints={aiSummary.keyPoints}
                onRegenerate={() =>
                  handleSendPrompt(templates[0]?.template || '', templates[0]?.id || '')
                }
                renderMarkdown={renderMarkdown}
                renderInlineMarkdown={renderInlineMarkdown}
              />
            )}

            {/* Empty State */}
            {!aiSummary && messages.length === 0 && !isLoading && !error && (
              <EmptyState
                onSendPrompt={handleSendPrompt}
                loading={isLoading}
                templates={templates}
                onSelectTemplate={selectTemplate}
                selectedTemplateId={selectedPromptId}
              />
            )}
          </Container>
        </Content>
      </Panel>
    </Host>
  );
}
