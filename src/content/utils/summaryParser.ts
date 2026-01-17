export function parseSummaryFromContent(content: string): { summary: string; keyPoints: string[] } {
  const keyPointsHeading = /^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:关键要点|关键点|Key Points?)\s*(?:\*\*)?\s*:?\s*$/im;
  const keyPointsMatch = content.match(keyPointsHeading);

  if (keyPointsMatch && typeof keyPointsMatch.index === "number") {
    const summaryPart = content.substring(0, keyPointsMatch.index).trim();
    const afterHeading = content.slice(keyPointsMatch.index + keyPointsMatch[0].length);
    const keyPointsText = afterHeading.replace(/^[\r\n\s]+/, "");

    const keyPoints = keyPointsText
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line) => line.length > 0 && line.length < 200)
      .slice(0, 10);

    return { summary: summaryPart, keyPoints };
  }

  return { summary: content, keyPoints: [] };
}
