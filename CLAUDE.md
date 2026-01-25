# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This is a Chrome Extension (Manifest V3) for summarizing page content using LLM.
It supports varying AI LLM providers such as OpenAI, Anthropic, minimax, deepseek,etc.
It will inject a fixed and floated sidebar icon into the webpage.
When clicked, it extracts the main content of the page, sends it to the selected LLM API for summarization, and displays the summary in the sidebar.
User is able to ask follow-up questions based on the summary in the chat input.
User is able to configure API keys and settings on settings page.

## Architecture
The extension App is based on the following tech stacks:
  - pnpm to manage dependencies
  - vitest for testing
  - zustand to manage state
  - emotion for styling css-in-js
  - React + TypeScript + Vite for the sidebar content

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build extension (TypeScript check + Vite build + path fix)
npm run test         # Run Vitest tests
npm run lint         # Run ESLint
```

## Project structures
- `src/` All source code
- `src/content` Sidebar React app and content script
- `src/background` Background service worker to communicate between the extension and LLM providers

