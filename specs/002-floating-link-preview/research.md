# Research: Floating Link Preview

## R-001: Iframe Embedding and Frame Restriction Detection

**Decision**: Use a composite detection approach — iframe `onload` event + `contentDocument` access check + 3-second timeout fallback.

**Rationale**: Chrome silently blocks iframes when X-Frame-Options: DENY or CSP frame-ancestors restrictions are present. No DOM events fire for these blocks. The composite approach covers all failure modes: network errors (onerror), policy blocks (timeout + contentDocument null check), and slow loads (timeout).

**Alternatives considered**:
- **chrome.webRequest header inspection**: Deprecated in Manifest V3; not available
- **chrome.declarativeNetRequest**: Can read response headers but cannot strip X-Frame-Options (browser enforces security headers regardless); useful only for logging
- **postMessage probe**: Unreliable for cross-origin iframes

**Key finding**: Extensions cannot strip or modify X-Frame-Options/CSP headers. The fallback UI (FR-011) is mandatory by design, not a workaround.

## R-002: CSS Backdrop Filter (Frosted Glass Effect)

**Decision**: Use `backdrop-filter: blur(6px)` with `background: rgba(0, 0, 0, 0.2)` on a full-page fixed overlay element.

**Rationale**: `backdrop-filter` is widely supported in all modern Chrome versions including content scripts injected by Manifest V3 extensions. Blur radius of 6px provides a clear frosted glass effect without GPU performance issues.

**Alternatives considered**:
- **Canvas-based blur**: Complex, poor performance, unnecessary since CSS support is universal in Chrome
- **SVG filter**: More verbose, no advantage over backdrop-filter in Chrome
- **Higher blur radius (>10px)**: Can cause jank on older GPUs

**Key finding**: backdrop-filter creates a new stacking context. The floating window must have a higher z-index than the backdrop element.

## R-003: Floating Window Resize Implementation

**Decision**: Use CSS `resize: both` on the floating window container with an `overflow: auto` wrapper, combined with a ResizeObserver to detect when the user starts resizing.

**Rationale**: Native CSS resize handles are the simplest approach (Simplicity First). ResizeObserver fires when dimensions change, which is the signal to remove the backdrop blur (FR-017).

**Alternatives considered**:
- **Custom drag handles with mousedown/mousemove**: More control over appearance but significantly more code; violates Simplicity First for no clear benefit
- **Pointer events on corner/edge regions**: Complex hit-testing logic

## R-004: Content Script Injection Strategy

**Decision**: Use manifest-declared content_scripts with `"matches": ["<all_urls>"]` and `"run_at": "document_idle"`.

**Rationale**: The extension must intercept Shift+Cmd+Click on any page. Manifest-declared injection is simpler and more reliable than programmatic injection via `chrome.scripting.executeScript`. Running at document_idle ensures the DOM is ready without blocking page load.

**Alternatives considered**:
- **Programmatic injection via chrome.scripting**: Requires user action to trigger (activeTab); more complex; would need popup or browser action click first
- **document_start injection**: Unnecessary; we don't need to intercept anything before DOM is ready

## R-005: Content Script to Service Worker Communication

**Decision**: Use `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` with typed message objects defined in `src/shared/messages.ts`.

**Rationale**: Standard Chrome extension messaging pattern. Type-safe message definitions ensure content script and service worker agree on message shapes. Only needed for promote-to-tab (creating a new tab requires service worker).

**Alternatives considered**:
- **chrome.runtime.connect (long-lived port)**: Overkill for simple request-response; adds connection management complexity
- **Shared state via chrome.storage**: Async and unnecessary for synchronous actions like tab creation
