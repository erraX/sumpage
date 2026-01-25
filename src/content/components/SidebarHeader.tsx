import { Header, HeaderTitle, NewChatButton, CloseButton } from "./styles";

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
  showNewChat?: boolean;
  onNewChat?: () => void;
}

export function SidebarHeader({
  title,
  onClose,
  showNewChat = false,
  onNewChat,
}: SidebarHeaderProps) {
  return (
    <Header>
      <HeaderTitle>{title}</HeaderTitle>
      {showNewChat && onNewChat && (
        <NewChatButton onClick={onNewChat} title="New Chat">
          +
        </NewChatButton>
      )}
      <CloseButton onClick={onClose}>
        <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
      </CloseButton>
    </Header>
  );
}
