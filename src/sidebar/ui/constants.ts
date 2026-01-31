import { PromptTemplate } from './models';

export const DEFAULT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'default',
  name: 'Default Summary',
  template: `Please summarize the following webpage content:

Title: {title}

Content:
{content}

Please provide:
1. A concise summary (2-3 paragraphs)
2. 3-5 key points as bullet points

Format your response as:
## Summary
[your summary here]

## Key Points
- [key point 1]
- [key point 2]
- [key point 3]`,
  isDefault: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
