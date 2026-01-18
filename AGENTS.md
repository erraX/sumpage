# Repository Guidelines

## Project Structure & Module Organization
This is a Manifest V3 Chrome extension built with Vite + React + TypeScript.

- `src/background/` contains the service worker entry (`service-worker.ts`).
- `src/content/` holds the content script entry (`content.tsx`), sidebar UI, and supporting utils/components.
- `src/utils/` and `src/types/` keep shared helpers and type definitions.
- `src/__tests__/` holds Vitest suites.
- `public/` contains extension assets like `manifest.json` and `icon.svg`.
- `dist/` is generated output; do not edit by hand.
- `build-content.mjs` runs in the build pipeline to finalize the extension bundle.

## Build, Test, and Development Commands
```bash
npm run dev            # Start Vite dev server for local development
npm run build          # Type-check + build extension into dist/
npm run test           # Run Vitest in watch mode
npm run test -- --run  # Run tests once (CI style)
npm run lint           # Run ESLint on TypeScript/React files
npm run preview        # Preview production build locally
```

## Coding Style & Naming Conventions
- TypeScript + React with 2-space indentation, double quotes, and semicolons.
- Components and React files use PascalCase names (e.g., `SummaryView.tsx`).
- Utilities use camelCase and live under `src/utils/`.
- Tests follow `*.test.ts`/`*.test.tsx` naming and live under `src/__tests__/` or alongside sources.
- ESLint is configured via `eslint.config.js`; run `npm run lint` before PRs. Prettier is installed for formatting consistency.

## Testing Guidelines
- Framework: Vitest with `jsdom` (`vitest.config.ts`).
- Test discovery includes `src/**/*.{test,spec}.{js,ts,jsx,tsx}`.
- Keep new tests focused on summarization logic, storage helpers, and content script behaviors.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative, capitalized subjects (e.g., "Fix chat persistence"). Follow that pattern; avoid vague messages like "update".
- PRs should include a clear description, testing notes (`npm run test`, `npm run lint`), and screenshots for UI changes.

## Security & Configuration Tips
- API keys or provider configs are stored in Chrome `storage.local`; never commit secrets or local config artifacts.
