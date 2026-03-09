# Data Model: Floating Link Preview

This feature has no persistent data. All state is ephemeral (exists only while the floating window is open on a given page).

## Runtime State

### Floating Window State

Represents the current state of the floating window overlay. Only one instance exists at a time per tab.

| Field | Type | Description |
|-------|------|-------------|
| isOpen | boolean | Whether the floating window is currently visible |
| currentUrl | string | The URL loaded in the iframe |
| isLoading | boolean | Whether the iframe is still loading content |
| isResized | boolean | Whether the user has manually resized the window (controls backdrop visibility) |
| hasEmbedError | boolean | Whether the iframe failed to load due to frame restrictions |

### State Transitions

```text
CLOSED → LOADING → LOADED → CLOSED
                 → EMBED_ERROR → CLOSED
LOADED → RESIZED (backdrop removed)
LOADED → LOADING (new URL via Shift+Cmd+Click on another link)
LOADED → PROMOTED (new tab opened, window closes → CLOSED)
RESIZED → LOADING (new URL resets to centered 85%, backdrop restored)
```

### Messages (Content Script ↔ Service Worker)

| Message | Direction | Fields | Purpose |
|---------|-----------|--------|---------|
| PROMOTE_TO_TAB | content → service worker | url: string | Request to open URL in new tab |
| TAB_CREATED | service worker → content | success: boolean | Confirm tab was created, content script closes window |

## Relationships

```text
Content Script (per tab)
├── manages → Floating Window State (one per tab)
├── creates → Backdrop DOM element
├── creates → Floating Window DOM element
│   ├── contains → Toolbar DOM element
│   │   ├── contains → Address bar (read-only URL display)
│   │   ├── contains → Close button
│   │   └── contains → Promote-to-tab button
│   └── contains → Iframe (embedded page)
└── sends messages to → Service Worker

Service Worker (global)
└── handles → PROMOTE_TO_TAB messages (creates new tab via chrome.tabs.create)
```
