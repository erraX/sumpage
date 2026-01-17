interface SummaryViewProps {
  summary: string;
  keyPoints: string[];
  onRegenerate: () => void;
  renderMarkdown: (content: string) => string;
  renderInlineMarkdown: (content: string) => string;
}

export function SummaryView({
  summary,
  keyPoints,
  onRegenerate,
  renderMarkdown,
  renderInlineMarkdown,
}: SummaryViewProps) {
  return (
    <div className="sumpage-result">
      <div className="sumpage-ai-badge">AI Generated</div>
      <div
        className="sumpage-markdown-section sumpage-markdown-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
      />
      {keyPoints.length > 0 && (
        <div className="sumpage-markdown-section">
          <h3>Key Points</h3>
          <ul className="sumpage-key-points">
            {keyPoints.map((point, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(point) }} />
            ))}
          </ul>
        </div>
      )}
      <div className="sumpage-actions">
        <button className="sumpage-refresh-btn" onClick={onRegenerate}>
          Regenerate
        </button>
      </div>
    </div>
  );
}
