import { useState, useEffect, useCallback, useRef } from 'react';
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
import { useChatStore, useUIStore, useSettingsStore } from './stores';
import { useChat, useChatScroll } from './hooks/useChat';
import { useSummarizer, useAISummary } from './hooks/useSummarizer';
import { usePromptTemplates } from './hooks/usePromptTemplates';
import * as templatesStorage from './store/templatesStorage';
import { DEFAULT_PROMPT_TEMPLATE } from '../types';

interface SidebarAppProps {
  onClose: () => void;
  showSettings?: boolean;
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

export function SidebarApp({
  onClose,
  showSettings: initialShowSettings = false,
}: SidebarAppProps) {
  // Local UI state
  const [showSettings, setShowSettings] = useState(initialShowSettings);
  const [selectedPromptName, setSelectedPromptName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand stores
  const { messages, inputValue, isLoading: chatLoading } = useChatStore();
  const hasChat = messages.length > 0;
  const {
    isLoading,
    loadingStep,
    error,
    setError,
    setShowSettings: setShowSettingsStore,
  } = useUIStore();

  // Custom hooks
  const { sendMessage, setInputValue, clearChat } = useChat();
  const { summarize, summarizeWithTemplate, checkConfiguration } = useSummarizer();
  const { loadTemplates, selectTemplate, templates } = usePromptTemplates();

  // Derived state (Vercel `rerender-derived-state`)
  const aiSummary = useAISummary(messages);

  // Initialize on mount
  useEffect(() => {
    templatesStorage.initializePromptTemplates(DEFAULT_PROMPT_TEMPLATE).then(async () => {
      await checkConfiguration({ closeIfConfigured: true });
      await loadTemplates();

      // Load selected prompt name
      const promptId = await templatesStorage.getSelectedPromptId();
      if (promptId) {
        const prompt = await templatesStorage.getPromptTemplate(promptId);
        if (prompt) {
          setSelectedPromptName(prompt.name);
        }
      } else {
        const defaultPrompt = templates.find((t) => t.isDefault);
        if (defaultPrompt) {
          setSelectedPromptName(defaultPrompt.name);
        }
      }
    });
  }, [checkConfiguration, loadTemplates, templates]);

  // Auto-scroll to bottom of chat
  useChatScroll(messages, messagesEndRef);

  // Event handlers (memoized)
  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const startNewChat = useCallback(() => {
    clearChat();
    setError(null);
  }, [clearChat, setError]);

  const handleSendPrompt = useCallback(
    async (promptTemplate: string, promptId: string) => {
      await templatesStorage.setSelectedPromptId(promptId);
      const prompt = await templatesStorage.getPromptTemplate(promptId);
      if (prompt) {
        setSelectedPromptName(prompt.name);
      }
      await summarizeWithTemplate(promptTemplate);
    },
    [summarizeWithTemplate]
  );

  const handleSettingsComplete = useCallback(async () => {
    const configured = await checkConfiguration({ closeIfConfigured: true });
    if (configured) {
      setShowSettings(false);
      setShowSettingsStore(false);
    }
  }, [checkConfiguration, setShowSettingsStore]);

  // Show settings view
  if (showSettings) {
    return (
      <Host>
        <Panel>
          <SettingsView onComplete={handleSettingsComplete} onBack={() => setShowSettings(false)} />
        </Panel>
      </Host>
    );
  }

  // Main content view
  return (
    <Host>
      <Panel>
        <MainView
          title='Sumpage'
          onClose={onClose}
          showNewChat={hasChat}
          onNewChat={startNewChat}
        />
        <Content>
          <Container>
            {/* Loading State */}
            {isLoading && <LoadingStatus step={loadingStep} />}

            {/* Error State */}
            {error && <ErrorNotice message={error} onRetry={aiSummary ? sendMessage : summarize} />}

            {/* Chat Messages */}
            {messages.length > 0 && !isLoading && (
              <ChatView
                messages={messages}
                loading={chatLoading}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={sendMessage}
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
                onRegenerate={() => summarize()}
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
                selectedTemplateId={useSettingsStore.getState().selectedPromptId}
              />
            )}
          </Container>
        </Content>
      </Panel>
    </Host>
  );
}
