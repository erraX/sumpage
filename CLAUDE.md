# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build extension (TypeScript check + Vite build + path fix)
npm run test         # Run Vitest tests
npm run test -- --run  # Run tests once (CI mode)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture

This is a Chrome Extension (Manifest V3) for summarizing page content using LLM.
It supports varying AI LLM providers such as OpenAI, Anthropic, minimax, deepseek,etc.
User is able to configure API keys and settings via the popup UI.

### Components

**Popup (`src/popup/`)** - React UI triggered when clicking the extension icon. Uses `chrome.scripting.executeScript()` to run summarization logic in the active tab's context.

**Content Script (`src/content/content.tsx`)** - Injected into pages, handles message passing and provides summarization functions. Exports `extractPageContent()`, `generateSummary()`, `extractKeyPoints()`, and `createPageSummary()` for testing.

**Summarization Logic** - Extractive algorithm that:
1. Extracts text from `document.body.innerText`
2. Splits into sentences using regex `/(?<=[.!?])\s+/`
3. Scores sentences by position (first/last), length (10-30 words), and capitalization
4. Returns top-scored sentences and key points

### Type Definitions (`src/types.ts`)

- `PageSummary` - Core data structure with title, textContent, wordCount, summary, keyPoints
- `ContentScriptMessage` - Message types for popup-content communication

## Build Output

The `dist/` folder contains the loadable Chrome extension:
- `manifest.json` - Extension manifest
- `popup.html`, `popup.js`, `popup.css` - Popup UI
- `content.js` - Content script
- `icon.svg` - Extension icon

To load: Open `chrome://extensions`, enable developer mode, "Load unpacked" and select `dist/`.
Use 'bd' for task tracking
