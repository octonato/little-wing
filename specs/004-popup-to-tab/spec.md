# Feature Specification: Popup-to-Tab Keyboard Shortcut

**Feature Branch**: `004-popup-to-tab`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "add a shortcut (Cmd+T) to promote a pop-up to a tab."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Promote Popup to Tab via Keyboard (Priority: P1)

A user has opened a floating link preview popup (via Shift+Cmd+Click) and wants to promote it to a regular browser tab without reaching for the mouse. While focused on the popup window, the user presses Cmd+T to instantly move the popup content into a tab in the original parent window.

**Why this priority**: This is the core feature — providing a keyboard-driven alternative to the existing floating "Open in Tab" button. Power users and keyboard-centric users benefit from not breaking their flow to reach for the mouse.

**Independent Test**: Can be fully tested by opening a floating popup with Shift+Cmd+Click on any link, then pressing Cmd+T in the popup window. The popup should close and the page should appear as a new tab in the parent window.

**Acceptance Scenarios**:

1. **Given** a floating popup window is open with a previewed link, **When** the user presses Cmd+T while the popup is focused, **Then** the popup content is moved to a new tab in the parent browser window and the popup window closes.
2. **Given** a floating popup window is open, **When** the user presses Cmd+T, **Then** focus shifts to the parent window with the newly created tab active.
3. **Given** the user is on a regular browser tab (not a popup), **When** the user presses Cmd+T, **Then** the default browser behavior (new tab) occurs — the shortcut is not intercepted.

---

### User Story 2 - Keyboard Shortcut Coexists with Button (Priority: P2)

The existing floating "Open in Tab" button continues to work alongside the new keyboard shortcut. Both methods trigger the same promote-to-tab action, giving users the choice of mouse or keyboard.

**Why this priority**: Ensures backward compatibility — existing users who rely on the button are not disrupted.

**Independent Test**: Open a floating popup, verify both the Cmd+T shortcut and the floating button independently promote the popup to a tab.

**Acceptance Scenarios**:

1. **Given** a floating popup is open, **When** the user clicks the "Open in Tab" button, **Then** the popup is promoted to a tab (existing behavior unchanged).
2. **Given** a floating popup is open, **When** the user presses Cmd+T instead of clicking the button, **Then** the same promote-to-tab action occurs.

---

### Edge Cases

- What happens if the user presses Cmd+T when the popup has already been closed or is closing? The shortcut should be a no-op with no errors.
- What happens if the user presses Cmd+T on a non-macOS platform? The shortcut should use Ctrl+T as the equivalent key combination.
- What happens if multiple Cmd+T presses occur rapidly? Only the first should trigger the promotion; subsequent presses should be ignored since the popup will already be closing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST intercept the Cmd+T (macOS) / Ctrl+T (other platforms) keyboard shortcut when a floating popup window is focused.
- **FR-002**: When Cmd+T is pressed in a popup window, the extension MUST promote the popup content to a tab in the parent window, using the same mechanism as the existing "Open in Tab" button.
- **FR-003**: The Cmd+T shortcut MUST only be active within floating popup windows created by the extension — it MUST NOT interfere with normal browser behavior on regular pages.
- **FR-004**: The existing floating "Open in Tab" button MUST continue to function unchanged.
- **FR-005**: The shortcut MUST prevent the browser's default Cmd+T behavior (open new tab) when triggered inside a popup window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can promote a popup to a tab using only the keyboard, without needing to interact with the floating button.
- **SC-002**: The keyboard shortcut responds within the same timeframe as the existing button interaction — no perceptible delay.
- **SC-003**: Normal browser Cmd+T behavior is unaffected on all non-popup pages.

## Assumptions

- The user intends Cmd+T specifically for macOS; Ctrl+T will be used as the cross-platform equivalent (consistent with standard browser shortcut conventions).
- The shortcut reuses the existing promote-to-tab mechanism — no new promotion logic is needed.
- The Esc-to-close shortcut already established in the popup remains unchanged and coexists with the new Cmd+T shortcut.
