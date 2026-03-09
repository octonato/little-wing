# Quickstart: Floating Link Preview

## Prerequisites

- [Bun](https://bun.sh) installed (v1.0+)
- Chrome browser
- Little Wing extension loaded (see `specs/001-chrome-extension/quickstart.md`)

## Development

```bash
# Install dependencies (if not already done)
bun install

# Build the extension
bun run build

# Watch mode (rebuilds on changes)
bun run dev
```

After building, reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the reload icon on the Little Wing extension

## Testing the Feature

### Basic Flow (US1 + US2)
1. Navigate to any webpage with links (e.g., Wikipedia, Hacker News)
2. Hold **Shift+Cmd** and click any link
3. A floating window should appear centered with a frosted glass backdrop
4. The linked page loads inside the floating window
5. Press **Esc** to close the floating window

### Toolbar (US3)
1. Open a floating window (Shift+Cmd+Click a link)
2. Verify the toolbar shows the URL of the linked page
3. Verify close button (X) and promote-to-tab button are visible
4. Click close button — window should close

### Promote to Tab (US4)
1. Open a floating window (Shift+Cmd+Click a link)
2. Click the promote-to-tab button in the toolbar
3. A new tab should open with the same URL
4. Focus should move to the new tab
5. The floating window should close automatically

### Resize Behavior (FR-016, FR-017)
1. Open a floating window
2. Drag the edge or corner of the floating window to resize it
3. The blurred backdrop should disappear
4. The underlying page should be visible (unblurred) behind the window

### Embed Fallback (FR-011)
1. Open a floating window on a link to a site that blocks iframes (e.g., GitHub)
2. After a few seconds, a fallback message should appear
3. The fallback should offer a button to open the page in a new tab

### Non-Interference (FR-012)
1. Click a link normally (without holding Shift+Cmd)
2. The browser should navigate as usual — no floating window

## Lint & Format

```bash
bun run lint
bun run lint:fix
bun run format
```
