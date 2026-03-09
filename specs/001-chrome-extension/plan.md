# Implementation Plan: Chrome Extension Project Setup

**Branch**: `001-chrome-extension` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-chrome-extension/spec.md`

## Summary

Set up the Little Wing project as a Chrome Extension (Manifest V3) using Bun as the package manager and TypeScript bundler. The project will include a popup page, background service worker, dev watch mode, production build, and linting via Biome.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, per constitution)
**Primary Dependencies**: Bun (bundler + package manager), Biome (linting + formatting), @anthropic/chrome-types (Chrome API types)
**Storage**: N/A
**Testing**: Bun test runner (`bun test`)
**Target Platform**: Chrome browser (Manifest V3)
**Project Type**: Chrome extension
**Performance Goals**: Incremental rebuild < 5 seconds
**Constraints**: No `any` types; Bun minification cannot be combined with multiple entry points (use separate build steps or skip minification for multi-entry)
**Scale/Scope**: Single developer project, minimal extension scaffold

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Single Responsibility | PASS | Each source file has one concern: popup UI, service worker logic, build script |
| II. Clean Boundaries | PASS | Popup and service worker are naturally isolated by Chrome's extension architecture |
| III. Meaningful Naming | PASS | Standard Chrome extension naming conventions (popup, background, manifest) |
| IV. Simplicity First | PASS | Bun eliminates separate bundler tooling; Biome replaces ESLint+Prettier combo |
| V. Testability by Design | PASS | Bun test runner included; pure logic separated from Chrome API side effects |
| Language & Type Safety | PASS | TypeScript strict mode, no `any`, `chrome-types` for API type safety |
| General Standards | PASS | Short files, explicit error handling in build script |

## Project Structure

### Documentation (this feature)

```text
specs/001-chrome-extension/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── popup/
│   ├── popup.html
│   └── popup.ts
├── background/
│   └── service-worker.ts
└── build.ts

dist/                    # Build output (gitignored)
├── popup/
│   ├── popup.html
│   └── popup.js
├── background/
│   └── service-worker.js
└── manifest.json

static/
└── manifest.json        # Source manifest, copied to dist on build

tests/
└── unit/

biome.json
bunfig.toml
tsconfig.json
package.json
```

**Structure Decision**: Flat `src/` with subdirectories per extension entry point. No framework overhead. The `static/` directory holds assets copied verbatim to `dist/`. Build script (`src/build.ts`) uses Bun's programmatic API for multi-entry bundling and asset copying.

## Complexity Tracking

No constitution violations. Table not needed.
