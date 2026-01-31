import styled from '@emotion/styled';
import { theme } from '../theme';

// Layout
export const Host = styled.div`
  font-family: ${theme.font};
  color: ${theme.ink};
  contain: layout style;

  * {
    box-sizing: border-box;
  }
`;

export const Panel = styled.div`
  background: transparent;
`;

export const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, #f9fbfa 0%, #f1f5f3 100%);

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #efe9e1;
  }
  &::-webkit-scrollbar-thumb {
    background: #c6d5d0;
    border-radius: 999px;
    border: 2px solid #efe9e1;
  }
`;

export const Container = styled.div`
  max-width: 360px;
  margin: 0 auto;
  padding: 10px 18px 24px;
`;

export const Content = styled.div`
  padding: 0;
`;

// Header
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px 4px;
  margin: 0 14px 12px;
  border-bottom: 1px dashed ${theme.border};
`;

export const HeaderTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${theme.muted};
  margin: 0;
`;

export const NewChatButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: ${theme.accentSoft};
  border: 1px solid ${theme.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.accentStrong};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.accent};
    color: ${theme.white};
  }
`;

export const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  color: ${theme.white};
  font-size: 18px;
  line-height: 1;

  ${Header} & {
    display: flex;
  }
`;

// Loading
export const LoadingContainer = styled.div<{ $success?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .sumpage-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.border};
    border-top-color: ${props => props.$success ? theme.success : theme.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: ${props => props.$success ? theme.success : theme.muted};
    font-size: 14px;
    margin: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Error
export const ErrorContainer = styled.div`
  background: ${theme.warningBg};
  border: 1px solid ${theme.warningBorder};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;

  p {
    color: ${theme.warningText};
    font-size: 14px;
    margin: 0 0 12px 0;
  }
`;

export const RetryButton = styled.button`
  background: ${theme.accent};
  color: ${theme.white};
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.accentStrong};
  }
`;

// Result
export const ResultContainer = styled.div`
  background: ${theme.surface};
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(22, 52, 50, 0.08);
  border: 1px solid ${theme.border};
`;

export const AIBadge = styled.div`
  display: inline-block;
  background: ${theme.accentSoft};
  color: ${theme.accentStrong};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MarkdownSection = styled.div<{ $last?: boolean }>`
  margin-bottom: ${props => props.$last ? '0' : '16px'};

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: ${theme.ink};
    margin: 0 0 10px 0;
  }
`;

export const MarkdownContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${theme.muted};
  overflow-wrap: anywhere;
  word-break: break-word;

  p {
    margin: 0 0 10px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  h1, h2, h3, h4 {
    color: ${theme.ink};
    margin: 16px 0 8px 0;
  }

  ul, ol {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 6px;
  }

  pre {
    margin: 10px 0;
    padding: 10px 12px;
    background: #f0f2f1;
    border: 1px solid ${theme.border};
    border-radius: 10px;
    white-space: pre-wrap;
    overflow-x: auto;
    max-width: 100%;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
  }
`;

export const KeyPoints = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 10px;
    font-size: 13px;
    color: ${theme.muted};
    line-height: 1.5;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${theme.accent};
    }
  }
`;

export const Actions = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${theme.border};
`;

export const RefreshButton = styled.button`
  width: 100%;
  background: ${theme.accentSoft};
  color: ${theme.accentStrong};
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d4e7e4;
  }
`;

// Empty State
export const EmptyContainer = styled.div`
  text-align: left;
  padding: 24px 16px 32px;

  p {
    color: ${theme.muted};
    font-size: 12px;
    margin: 6px 0 0;
  }
`;

export const SummarizeButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  background: ${theme.accent};
  color: ${theme.white};
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: 0 8px 16px rgba(22, 52, 50, 0.25);
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover {
    transform: ${props => props.$disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.$disabled ? 'none' : '0 10px 20px rgba(22, 52, 50, 0.3)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const PromptPanel = styled.div`
  position: relative;
  padding: 16px;
  border: 1px solid ${theme.border};
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f7f5 100%);
  box-shadow: 0 10px 22px rgba(22, 52, 50, 0.08);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120px 120px at 10% 0, rgba(47, 111, 106, 0.12), transparent 60%),
      radial-gradient(160px 160px at 100% 10%, rgba(47, 111, 106, 0.08), transparent 60%);
    pointer-events: none;
  }

  > * {
    position: relative;
  }
`;

export const PromptHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${theme.ink};
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: ${theme.muted};
  }
`;

export const PromptCount = styled.span`
  background: ${theme.accentSoft};
  color: ${theme.accentStrong};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
`;

export const PromptTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

export const PromptTab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #d5e2de;
  background: ${props => props.$active ? theme.accent : '#f2f6f4'};
  color: ${props => props.$active ? theme.white : theme.muted};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease;

  ${props => props.$active && `
    border-color: transparent;
    box-shadow: 0 10px 18px rgba(47, 111, 106, 0.25);
  `}

  &:hover:not(:disabled) {
    background: ${props => props.$active ? theme.accent : '#e8f1ee'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PromptTabBadge = styled.span`
  background: rgba(47, 111, 106, 0.12);
  color: ${theme.accentStrong};
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;

  ${PromptTab}:not([data-active="false"]) & {
    background: rgba(255, 255, 255, 0.2);
    color: ${theme.white};
  }
`;

export const PromptTabTitle = styled.span``;

export const PromptEditor = styled.div`
  background: #fbfbfa;
  border: 1px solid ${theme.border};
  border-radius: 14px;
  padding: 12px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  margin-bottom: 14px;
`;

export const PromptEditorHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

export const PromptEditorTitle = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.muted};
`;

export const PromptEditorHint = styled.span`
  font-size: 11px;
  color: ${theme.muted};
`;

export const PromptTextarea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  resize: vertical;
  min-height: 140px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.55;
  color: ${theme.ink};
`;

export const PromptSend = styled.div`
  margin-top: 6px;
`;

// Chat
export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  max-height: 600px;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 12px;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #efe9e1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c6d5d0;
    border-radius: 999px;
    border: 2px solid #efe9e1;
  }
`;

export const ChatMessageStyled = styled.div<{ $role: 'user' | 'assistant' }>`
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  max-width: 92%;
  overflow: hidden;
  background: ${props => props.$role === 'user' ? theme.accent : theme.surface};
  color: ${props => props.$role === 'user' ? theme.white : 'inherit'};
  margin-left: ${props => props.$role === 'user' ? 'auto' : '0'};
  margin-right: ${props => props.$role === 'assistant' ? 'auto' : '0'};
  border-bottom-right-radius: ${props => props.$role === 'user' ? '4px' : undefined};
  border-bottom-left-radius: ${props => props.$role === 'assistant' ? '4px' : undefined};
  border: ${props => props.$role === 'assistant' ? `1px solid ${theme.border}` : 'none'};
`;

export const ChatRole = styled.div<{ $role: 'user' | 'assistant' }>`
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
  opacity: 0.7;
  color: ${props => props.$role === 'user' ? 'rgba(249, 251, 250, 0.8)' : theme.accent};
`;

export const ChatContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  word-break: break-word;

  p {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin: 8px 0;
    padding-left: 18px;
  }

  li {
    margin-bottom: 4px;
  }

  pre {
    margin: 8px 0;
    padding: 10px 12px;
    background: #f0f2f1;
    border: 1px solid ${theme.border};
    border-radius: 10px;
    white-space: pre-wrap;
    overflow-x: auto;
    max-width: 100%;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
  }
`;

export const ChatTyping = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px 0;
`;

export const ChatTypingDot = styled.span<{ $index: number }>`
  width: 6px;
  height: 6px;
  background: ${theme.muted};
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
  animation-delay: ${props => props.$index * 0.2}s;

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.6;
    }
    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
`;

export const ChatPrompt = styled.div`
  margin: 8px 0 12px;
  padding: 10px;
  border: 1px solid ${theme.border};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
`;

export const ChatPromptHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

export const ChatPromptLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.muted};
`;

export const ChatPromptName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.accentStrong};
`;

export const ChatInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${theme.border};
  margin-top: auto;
`;

export const ChatInput = styled.textarea`
  flex: 1;
  padding: 12px 14px;
  border: 1px solid ${theme.border};
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: ${theme.surface};
  color: ${theme.ink};
  min-height: 48px;
  max-height: 150px;

  &::placeholder {
    color: ${theme.muted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.accent};
  }
`;

export const ChatSendButton = styled.button<{ $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: ${theme.accent};
  color: ${theme.white};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${theme.accentStrong};
    transform: scale(1.02);
  }
`;

// Settings
export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.muted};
  margin-bottom: 6px;
  letter-spacing: 0.01em;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.border};
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #fbfbfa;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18);
  }
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${theme.border};
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: #fbfbfa;
  min-height: 120px;
  max-height: 300px;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px rgba(47, 111, 106, 0.18);
  }
`;

export const BackButton = styled.button`
  background: ${theme.accent};
  color: ${theme.white};
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: ${theme.accentStrong};
  }
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  background: ${props => props.$active ? `linear-gradient(160deg, ${theme.accent} 0%, #3b837f 100%)` : theme.accentSoft};
  color: ${props => props.$active ? theme.white : theme.accentStrong};
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(22, 52, 50, 0.25);
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const AdvancedButton = styled.button`
  width: 100%;
  background: ${theme.accentSoft};
  color: ${theme.accentStrong};
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: #d4e7e4;
  }
`;

export const AdvancedSettings = styled.div`
  margin-bottom: 16px;
`;

export const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const SuccessMessage = styled.div`
  background: ${theme.successSoft};
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  text-align: center;
  color: ${theme.success};
  border: 1px solid ${theme.border};
`;

export const PromptItem = styled.div`
  border: 1px solid ${theme.border};
  border-radius: 8px;
  padding: 12px;
  background: ${theme.surface};
`;

export const PromptItemHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const PromptItemTitle = styled.span<{ $isDefault?: boolean }>`
  font-weight: 600;
  font-size: 14px;

  ${props => props.$isDefault && `
    &::after {
      content: "Default";
      font-size: 11px;
      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      background: ${theme.accentSoft};
      color: ${theme.accent};
      font-weight: 600;
    }
  `}
`;

export const PromptItemActions = styled.div`
  display: flex;
  gap: 4px;
`;

export const PromptItemButton = styled.button<{ $danger?: boolean; $confirming?: boolean }>`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$confirming ? theme.warningBorder : props.$danger ? theme.warningBg : theme.accentSoft};
  color: ${props => props.$confirming ? theme.warningText : props.$danger ? theme.warningText : theme.accentStrong};

  &:hover {
    background: ${props => props.$danger ? theme.warningBorder : theme.accent};
    color: ${props => props.$danger ? theme.warningText : theme.white};
  }
`;

export const PromptTemplatePre = styled.pre`
  font-size: 11px;
  margin: 0;
  padding: 8px;
  background: ${theme.bg};
  border-radius: 4px;
  overflow: auto;
  max-height: 100px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const PromptEditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const EditActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const NewPromptButton = styled.button`
  width: 100%;
  background: ${theme.accent};
  color: ${theme.white};
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(22, 52, 50, 0.25);
  }
`;

export const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
