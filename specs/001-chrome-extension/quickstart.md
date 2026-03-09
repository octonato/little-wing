# Quickstart: Chrome Extension Project Setup

## Prerequisites

- [Bun](https://bun.sh) installed (v1.0+)
- Chrome browser

## Setup

```bash
# Clone and enter the project
git clone <repo-url>
cd little-wing

# Install dependencies
bun install
```

## Development

```bash
# Build the extension (one-time)
bun run build

# Watch mode (rebuilds on file changes)
bun run dev
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist/` directory
5. The Little Wing extension icon appears in your toolbar

After running `bun run dev`, changes to source files trigger an automatic rebuild. Reload the extension in Chrome to pick up changes.

## Production Build

```bash
bun run build:prod
```

Produces an optimized bundle in `dist/` ready for Chrome Web Store submission.

## Linting

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix

# Format code
bun run format
```

## Testing

```bash
bun test
```

## Project Structure

| Path | Purpose |
|------|---------|
| `src/popup/` | Popup UI (HTML + TypeScript) |
| `src/background/` | Service worker (background logic) |
| `src/build.ts` | Build script using Bun.build() API |
| `static/manifest.json` | Chrome extension manifest (copied to dist) |
| `dist/` | Build output (gitignored) |
| `tests/` | Test files |
