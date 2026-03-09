# Implementation Plan: Floating Link Preview

**Branch**: `002-floating-link-preview` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-floating-link-preview/spec.md`

## Summary

Implement a Little Arc-style floating link preview for the Little Wing Chrome extension. Shift+Cmd+Click on any link opens the target page in a centered, resizable iframe overlay with a frosted glass backdrop, toolbar (URL bar, close, promote-to-tab), and fallback for non-embeddable pages.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, per constitution)
**Primary Dependencies**: Bun (bundler + package manager), Biome (linting + formatting), chrome-types (Chrome API types)
**Storage**: N/A
**Testing**: Bun test runner (`bun test`)
**Target Platform**: Chrome browser (Manifest V3), macOS initially
**Project Type**: Chrome extension (content script + service worker)
**Performance Goals**: Floating window appears within 500ms of trigger
**Constraints**: No `any` types; iframe embedding blocked by X-Frame-Options/CSP on some sites (fallback required); backdrop-filter blur radius ≤8px for GPU performance
**Scale/Scope**: Single developer project, single-tab overlay UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Single Responsibility | PASS | Content script handles DOM/UI; service worker handles tab creation and messaging; each file has one concern |
| II. Clean Boundaries | PASS | Content script ↔ service worker communicate via chrome.runtime messages; UI rendering isolated from browser API calls |
| III. Meaningful Naming | PASS | floating-window, toolbar, backdrop, trigger — all domain terms from spec |
| IV. Simplicity First | PASS | Pure DOM manipulation, no framework; CSS for layout/blur; minimal Chrome APIs |
| V. Testability by Design | PASS | UI creation functions are pure (take URL, return DOM); Chrome API calls isolated behind message passing |
| Language & Type Safety | PASS | TypeScript strict mode; chrome-types for API safety |
| General Standards | PASS | Each module well under 30 lines of core logic; explicit error handling for iframe load failures |

## Project Structure

### Documentation (this feature)

```text
specs/002-floating-link-preview/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── content.ts           # Entry point: link click interception + event coordination
│   ├── floating-window.ts   # Floating window DOM creation, positioning, resizing
│   ├── toolbar.ts           # Toolbar DOM: address bar, close button, promote button
│   └── styles.ts            # CSS injection: backdrop, floating window, toolbar styles
├── background/
│   └── service-worker.ts    # Tab creation (promote-to-tab), messaging
├── popup/
│   ├── popup.html
│   └── popup.ts
├── build.ts
└── shared/
    └── messages.ts          # Message type definitions shared between content + service worker

static/
└── manifest.json            # Updated with content_scripts and permissions

dist/                        # Build output (gitignored)
tests/
└── unit/
```

**Structure Decision**: Content script files split by responsibility: event handling (content.ts), UI creation (floating-window.ts, toolbar.ts), and styling (styles.ts). Shared message types in `src/shared/` ensure type-safe communication between content script and service worker. No framework — pure DOM manipulation.

## Complexity Tracking

No constitution violations. Table not needed.
