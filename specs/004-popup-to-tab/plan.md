# Implementation Plan: Popup-to-Tab Keyboard Shortcut

**Branch**: `004-popup-to-tab` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-popup-to-tab/spec.md`

## Summary

Add a Cmd+T (macOS) / Ctrl+T (other platforms) keyboard shortcut within the floating popup window to promote it to a regular browser tab. This reuses the existing `PROMOTE_TO_TAB` message and service worker handler — the only change is adding a keydown listener in the content script's `setupPopupControls()` function.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: chrome-types (Chrome API types), Bun (bundler + package manager), Biome (linting + formatting)
**Storage**: N/A
**Testing**: Manual testing (Chrome extension loaded unpacked)
**Target Platform**: Chromium-based browsers (Chrome, Edge, Arc, etc.)
**Project Type**: Chrome Extension (Manifest V3)
**Performance Goals**: Shortcut response must be imperceptible (same as existing button click)
**Constraints**: Must not intercept Cmd+T on non-popup pages; must coexist with existing Esc shortcut
**Scale/Scope**: Single keydown listener addition in one file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Single Responsibility | PASS | Change is confined to `setupPopupControls()` in `content.ts` — popup keyboard handling is its existing responsibility |
| II. Clean Boundaries | PASS | Reuses existing `PromoteToTabRequest` message interface — no new cross-boundary contracts needed |
| III. Meaningful Naming | PASS | No new identifiers required beyond the event handler |
| IV. Simplicity First | PASS | Minimal change — one additional keydown listener alongside existing Esc handler |
| V. Testability by Design | PASS | Shortcut logic is a pure event→message mapping, testable independently |
| Language & Type Safety | PASS | All code in TypeScript strict mode, uses typed message interfaces |
| General Standards | PASS | Change is ~5 lines, well within function length limits |

## Project Structure

### Documentation (this feature)

```text
specs/004-popup-to-tab/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── background/
│   └── service-worker.ts  # No changes needed — PROMOTE_TO_TAB handler already exists
├── content/
│   └── content.ts         # Add Cmd+T keydown listener in setupPopupControls()
├── shared/
│   └── messages.ts        # No changes needed — PromoteToTabRequest already defined
├── popup/
│   ├── popup.html
│   └── popup.ts
└── build.ts
```

**Structure Decision**: No structural changes. The feature is a single addition to the existing `content.ts` file within the `setupPopupControls()` function.
