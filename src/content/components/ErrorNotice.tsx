interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div className="sumpage-error">
      <p>{message}</p>
      <button className="sumpage-retry-btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
