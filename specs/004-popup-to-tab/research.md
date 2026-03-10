# Research: Popup-to-Tab Keyboard Shortcut

**Feature**: 004-popup-to-tab | **Date**: 2026-03-10

## No NEEDS CLARIFICATION Items

The technical context is fully resolved — no unknowns exist.

## Research Findings

### 1. Intercepting Cmd+T in a Chrome Extension Content Script

- **Decision**: Use `document.addEventListener("keydown", ...)` with `event.metaKey` (macOS) / `event.ctrlKey` (other platforms) + `event.key === "t"` check, followed by `event.preventDefault()` to suppress the browser's default new-tab behavior.
- **Rationale**: This is the same pattern already used for the Esc-to-close shortcut in `setupPopupControls()`. Content scripts can intercept keyboard events before the browser processes them when using `preventDefault()`.
- **Alternatives considered**:
  - Chrome Commands API (`chrome.commands`): Requires manifest changes and `"commands"` permission. Overly complex for a shortcut that only applies inside popup windows. Also cannot conditionally apply only in popup context.
  - `keyup` event: Slightly less responsive; `keydown` is preferred for shortcut interception since it fires first and allows `preventDefault()`.

### 2. Cross-Platform Modifier Key Detection

- **Decision**: Check `event.metaKey` for macOS (Cmd key) and `event.ctrlKey` for other platforms. Use `navigator.platform` or `navigator.userAgentData?.platform` to detect macOS.
- **Rationale**: Standard web practice. The existing Shift+Cmd+Click handler in `content.ts` already uses `event.metaKey`, establishing the pattern.
- **Alternatives considered**:
  - Checking both `metaKey` and `ctrlKey` always: Would cause false positives on macOS where Ctrl+T has different semantics. Better to be platform-aware.
  - Using only `metaKey`: Would not work on Windows/Linux where Cmd key doesn't exist.

### 3. Debouncing / Guard Against Rapid Presses

- **Decision**: Use a simple boolean guard (`isPromoting`) set to `true` on first trigger. No timer-based debounce needed since the popup window closes after promotion, removing the event listener.
- **Rationale**: Once `PROMOTE_TO_TAB` is sent, the service worker moves the tab and the popup window closes. The content script (and its listeners) are destroyed with the window. A boolean guard handles the brief window between sending the message and the popup closing.
- **Alternatives considered**:
  - `setTimeout`-based debounce: Unnecessary complexity; the window destruction handles cleanup naturally.
  - No guard at all: Risk of sending duplicate messages in the brief window before popup closes.
