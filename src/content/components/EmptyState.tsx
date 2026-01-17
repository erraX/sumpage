interface EmptyStateProps {
  onSummarize: () => void;
}

export function EmptyState({ onSummarize }: EmptyStateProps) {
  return (
    <div className="sumpage-empty">
      <p>Click the button below to summarize this page with AI</p>
      <button className="sumpage-summarize-btn" onClick={onSummarize}>
        Summarize Page
      </button>
    </div>
  );
}
