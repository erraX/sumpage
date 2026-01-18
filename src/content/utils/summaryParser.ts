export function parseSummaryFromContent(content: string): { summary: string; keyPoints: string[] } {
  return { summary: content, keyPoints: [] };
}
