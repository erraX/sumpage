import { memo } from "react";
import {
  ResultContainer,
  AIBadge,
  MarkdownSection,
  MarkdownContent,
  KeyPoints,
  Actions,
  RefreshButton,
} from "./styles";

interface SummaryViewProps {
  summary: string;
  keyPoints: string[];
  onRegenerate: () => void;
  renderMarkdown: (content: string) => string;
  renderInlineMarkdown: (content: string) => string;
}

export const SummaryView = memo(function SummaryView({
  summary,
  keyPoints,
  onRegenerate,
  renderMarkdown,
  renderInlineMarkdown,
}: SummaryViewProps) {
  return (
    <ResultContainer>
      <AIBadge>AI Generated</AIBadge>
      <MarkdownSection>
        <MarkdownContent
          dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
        />
      </MarkdownSection>
      {keyPoints.length > 0 && (
        <MarkdownSection>
          <h3>Key Points</h3>
          <KeyPoints>
            {keyPoints.map((point, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(point) }} />
            ))}
          </KeyPoints>
        </MarkdownSection>
      )}
      <Actions>
        <RefreshButton onClick={onRegenerate}>
          Regenerate
        </RefreshButton>
      </Actions>
    </ResultContainer>
  );
});
