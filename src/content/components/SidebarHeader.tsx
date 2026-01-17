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
    <div className="sumpage-sidebar-header">
      <h2 className="sumpage-sidebar-title">{title}</h2>
      {showNewChat && onNewChat && (
        <button className="sumpage-new-chat-btn" onClick={onNewChat} title="New Chat">
          +
        </button>
      )}
      <button className="sumpage-close-btn" onClick={onClose}>
        <span style={{ color: "white", fontSize: "18px", lineHeight: 1 }}>×</span>
      </button>
    </div>
  );
}
