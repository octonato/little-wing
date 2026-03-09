# Research: Chrome Extension Project Setup

## R-001: Bun as Chrome Extension Bundler

**Decision**: Use Bun's built-in `Bun.build()` API with a programmatic build script (`src/build.ts`).

**Rationale**: Bun natively supports multiple entry points, TypeScript compilation, and code splitting — all required for Chrome extension architecture (popup, service worker, content scripts). Using the programmatic API over CLI flags gives full control over asset copying and build steps.

**Alternatives considered**:
- **Webpack + ts-loader**: Heavy configuration, overkill for a simple extension
- **Vite + CRXJS**: Good DX but adds Vite as a dependency layer on top of Bun
- **esbuild directly**: Bun wraps esbuild internally with better TypeScript integration
- **tsc only**: No bundling, no asset pipeline, requires manual setup

**Key findings**:
- Bun supports `--watch` mode for file-change rebuilds
- Minification with multiple entry points can cause errors — use per-entry-point builds or skip minification
- Static assets (manifest.json, HTML) must be copied via build script; Bun doesn't auto-copy non-JS assets in programmatic mode

## R-002: Linting and Formatting

**Decision**: Use Biome as the single linting and formatting tool.

**Rationale**: Biome combines linting, formatting, and import organization in one tool. It's ~35x faster than ESLint+Prettier and requires minimal configuration. Aligns with constitution's Simplicity First principle.

**Alternatives considered**:
- **ESLint + Prettier**: Industry standard but requires multiple packages, plugin configuration, and conflict resolution between the two tools
- **Deno lint**: Not applicable since we're using Bun, not Deno

## R-003: Chrome API Type Safety

**Decision**: Use `@anthropic/chrome-types` or `@anthropic/anthropic` — actually, use the `chrome-types` package (published by AntFu) for Chrome API type definitions.

**Rationale**: Provides complete, auto-generated TypeScript types for all Chrome extension APIs. Eliminates need for `@types/chrome` (which is community-maintained and often lags behind).

**Alternatives considered**:
- **@types/chrome**: Community-maintained, sometimes outdated
- **Manual type declarations**: Error-prone and maintenance burden
- **No types, use `any`**: Violates constitution (Language & Type Safety)

## R-004: Watch Mode Implementation

**Decision**: Use Bun's `--watch` flag on the build script for development mode.

**Rationale**: `bun --watch src/build.ts` re-runs the build script on any imported file change. Uses OS-native filesystem watchers (kqueue on macOS). No additional dependency needed.

**Alternatives considered**:
- **chokidar + custom watcher**: Additional dependency for something Bun handles natively
- **nodemon**: Node.js-centric, unnecessary with Bun's built-in watch

## R-005: Test Runner

**Decision**: Use Bun's built-in test runner (`bun test`).

**Rationale**: Zero-config, Jest-compatible API, fast execution. No additional test framework dependency needed.

**Alternatives considered**:
- **Vitest**: Excellent but adds Vite dependency
- **Jest**: Slower, requires ts-jest or babel configuration
