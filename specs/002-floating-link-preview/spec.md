# Feature Specification: Floating Link Preview

**Feature Branch**: `002-floating-link-preview`
**Created**: 2026-03-09
**Status**: Draft
**Input**: User description: "Chrome extension mimicking Little Arc — Shift+Cmd+Click opens a link in a centered floating window overlay with address bar, close button, and promote-to-tab button"

## Clarifications

### Session 2026-03-09

- Q: What should the user see while the page is loading in the floating window? → A: Show the floating window immediately with a loading spinner until the page finishes loading.
- Q: Should the area behind the floating window be dimmed, blurred, or unmodified? → A: Blurred backdrop (frosted glass effect) behind the floating window.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Link in Floating Window (Priority: P1)

As a user browsing any webpage, I want to Shift+Cmd+Click on a link so that the linked page opens in a floating window overlaid on my current page, letting me preview content without losing my place.

**Why this priority**: This is the core interaction — without it, there is no feature. Everything else builds on this.

**Independent Test**: Can be tested by navigating to any webpage with links, holding Shift+Cmd, clicking a link, and verifying a centered floating window appears showing the linked page.

**Acceptance Scenarios**:

1. **Given** the user is on any webpage with links, **When** the user holds Shift+Cmd and clicks a link, **Then** a floating window appears centered in the browser viewport displaying the linked page.
2. **Given** the floating window is open, **When** the user inspects its dimensions, **Then** the window occupies 85% of the browser window's width and 85% of its height.
3. **Given** the user is on any webpage, **When** the user clicks a link normally (without Shift+Cmd), **Then** the default browser behavior occurs (no floating window).
4. **Given** the user holds Shift+Cmd and clicks a non-link element, **When** the click occurs, **Then** nothing happens (no floating window).
5. **Given** the user triggers a floating window on a slow-loading page, **When** the floating window appears, **Then** a loading spinner is visible until the page content finishes loading.

---

### User Story 2 - Close Floating Window (Priority: P2)

As a user viewing a floating window, I want to close it by pressing Esc or clicking a close button so that I can return to my original page.

**Why this priority**: Users need a clear way to dismiss the floating window. Without this, the overlay would trap users.

**Independent Test**: Can be tested by opening a floating window (US1), then pressing Esc or clicking the close button, and verifying the window disappears and the underlying page is fully interactive again.

**Acceptance Scenarios**:

1. **Given** a floating window is open, **When** the user presses the Esc key, **Then** the floating window closes and the underlying page is fully visible and interactive.
2. **Given** a floating window is open, **When** the user clicks the close button in the floating window's toolbar, **Then** the floating window closes.
3. **Given** no floating window is open, **When** the user presses Esc, **Then** nothing happens (no errors, default browser behavior preserved).

---

### User Story 3 - Floating Window Toolbar (Priority: P3)

As a user viewing a floating window, I want to see the URL of the page I opened and have quick actions available so that I know where I am and can choose what to do next.

**Why this priority**: The toolbar provides context (URL) and actions (close, promote). It completes the user experience but the core preview works without it.

**Independent Test**: Can be tested by opening a floating window and verifying the toolbar displays the correct URL, a close button, and a promote-to-tab button.

**Acceptance Scenarios**:

1. **Given** a floating window is open, **When** the user looks at the toolbar, **Then** the address bar displays the full URL of the loaded page.
2. **Given** a floating window is open, **When** the user clicks the close button in the toolbar, **Then** the floating window closes (same as Esc behavior).
3. **Given** a floating window is open, **When** the URL in the address bar is inspected after navigation within the floating window, **Then** the address bar reflects the current URL.

---

### User Story 4 - Promote to New Tab (Priority: P4)

As a user viewing content in a floating window, I want to promote it to a full browser tab so that I can continue browsing that page with full browser functionality.

**Why this priority**: This is a convenience feature that enhances the workflow but is not required for the core preview experience.

**Independent Test**: Can be tested by opening a floating window, clicking the promote-to-tab button, and verifying a new tab opens with the same URL and receives focus.

**Acceptance Scenarios**:

1. **Given** a floating window is open showing a page, **When** the user clicks the promote-to-tab button, **Then** a new browser tab opens with the same URL as the floating window.
2. **Given** the user clicked promote-to-tab, **When** the new tab opens, **Then** browser focus moves to the new tab.
3. **Given** the user clicked promote-to-tab, **When** the new tab opens, **Then** the floating window closes automatically.

---

### Edge Cases

- What happens when the user Shift+Cmd+Clicks a link that points to a PDF or file download? The floating window should attempt to load it; if the browser cannot render it inline, the floating window displays an error message suggesting the user promote it to a new tab.
- What happens when a floating window is already open and the user Shift+Cmd+Clicks another link? The existing floating window should navigate to the new URL rather than opening a second window.
- What happens when the user resizes the browser window while a floating window is open? The floating window should remain centered and maintain its 85% proportion relative to the new window size.
- What happens when the linked page refuses to be embedded (X-Frame-Options or CSP restrictions)? The floating window should display a message explaining the page cannot be previewed and offer a button to open it in a new tab instead.
- What happens when the user Shift+Cmd+Clicks a link with target="_blank"? The floating window should open as normal, overriding the target attribute.
- What happens when the user resizes the floating window? The blurred backdrop is removed and the underlying page becomes visible. The floating window remains freely positioned at its new size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST intercept Shift+Cmd+Click on links and prevent default navigation.
- **FR-002**: The extension MUST display a floating window centered in the browser viewport when triggered.
- **FR-003**: The floating window MUST occupy 85% of the browser window's width and 85% of its height.
- **FR-004**: The floating window MUST load and display the target URL of the clicked link.
- **FR-005**: The floating window MUST include a toolbar with: an address bar showing the current URL, a close button, and a promote-to-tab button.
- **FR-006**: The floating window MUST close when the user presses the Esc key.
- **FR-007**: The floating window MUST close when the user clicks the close button.
- **FR-008**: The promote-to-tab button MUST open the current floating window URL in a new browser tab, move focus to that tab, and close the floating window.
- **FR-009**: If a floating window is already open, a new Shift+Cmd+Click MUST navigate the existing window to the new URL rather than opening a second window.
- **FR-010**: The floating window MUST reposition and resize when the browser window is resized, maintaining 85% proportion and center alignment.
- **FR-011**: When a page cannot be embedded (due to frame restrictions), the floating window MUST display a fallback message with an option to open the page in a new tab.
- **FR-012**: The extension MUST NOT interfere with normal link clicks (without Shift+Cmd held).
- **FR-013**: The address bar MUST update if the page navigates within the floating window.
- **FR-014**: The floating window MUST appear immediately upon trigger with a loading spinner visible until the embedded page finishes loading.
- **FR-015**: The floating window MUST be displayed over a full-page blurred backdrop (frosted glass effect) that covers the underlying page content.
- **FR-016**: The floating window MUST be resizable by the user via drag handles on its edges or corners.
- **FR-017**: When the user resizes the floating window, the blurred backdrop MUST be removed and the underlying page becomes visible (unblurred) behind the floating window.

### Key Entities

- **Floating Window**: An overlay element displayed on top of the current page. Contains a toolbar and an embedded view of the target page. Only one can exist at a time.
- **Toolbar**: The header of the floating window. Contains the address bar (read-only URL display), close button, and promote-to-tab button.
- **Trigger**: The Shift+Cmd+Click keyboard-mouse combination that activates the floating window on a valid link element.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The floating window appears within 500ms of the Shift+Cmd+Click trigger.
- **SC-002**: 100% of normal link clicks (without Shift+Cmd) behave identically to browser default behavior.
- **SC-003**: The floating window correctly centers and sizes to 85% on all standard browser window sizes (from 800x600 to 2560x1440).
- **SC-004**: Users can complete the full workflow (open floating window, read content, close or promote to tab) within 3 seconds.
- **SC-005**: Pages that block embedding display the fallback message 100% of the time (no blank or broken frames).

## Assumptions

- The floating window uses an embedded frame to display the target page content. This means pages that set X-Frame-Options: DENY or restrictive Content-Security-Policy frame-ancestors will not render; a fallback experience is required.
- The Shift+Cmd modifier combination is specific to macOS. On Windows/Linux the equivalent would be Shift+Ctrl+Click, but this feature initially targets macOS only. Cross-platform support can be added in a future iteration.
- The floating window does not persist across page navigations of the host page — if the user navigates away from the current page, the floating window closes.
- The extension requires the "activeTab" permission to inject the content script and detect link clicks. No additional permissions are needed at this stage.
- The address bar in the toolbar is read-only (display only). Users cannot type or edit URLs in it.
