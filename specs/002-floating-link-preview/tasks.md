# Tasks: Floating Link Preview

**Input**: Design documents from `/specs/002-floating-link-preview/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not explicitly requested in the feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing project with content script infrastructure and shared types

- [x] T001 Update static/manifest.json to add content_scripts entry (matches all URLs, runs at document_idle, references content.js), and add "activeTab" permission
- [x] T002 [P] Create shared message type definitions (PROMOTE_TO_TAB request, TAB_CREATED response) in src/shared/messages.ts
- [x] T003 Update src/build.ts to add src/content/content.ts as a new entry point and copy output to dist/content/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS styles and floating window DOM creation that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create CSS styles module that injects styles for: backdrop (fixed, full-page, backdrop-filter blur(6px), rgba overlay), floating window (fixed, centered, 85vw/85vh, border-radius, box-shadow, z-index layering), toolbar, loading spinner, and fallback message in src/content/styles.ts
- [x] T005 Create floating window module with functions: createFloatingWindow(url) that builds the DOM structure (backdrop + window container + iframe), removeFloatingWindow() that tears down all injected DOM, and updateIframeUrl(url) that navigates the existing iframe to a new URL in src/content/floating-window.ts

**Checkpoint**: Style injection and DOM creation/removal functions are available for user story implementation

---

## Phase 3: User Story 1 - Open Link in Floating Window (Priority: P1) 🎯 MVP

**Goal**: Shift+Cmd+Click on a link opens a centered floating window with the linked page in an iframe, with frosted glass backdrop and loading spinner

**Independent Test**: Navigate to any page with links, Shift+Cmd+Click a link, verify floating window appears centered at 85% size with blurred backdrop. Verify normal clicks are unaffected.

### Implementation for User Story 1

- [x] T006 [US1] Implement content script entry point in src/content/content.ts that: adds a click event listener to the document, checks for metaKey+shiftKey modifiers, finds the nearest anchor element from the click target, extracts the href, calls createFloatingWindow(href), and calls preventDefault/stopPropagation to suppress default navigation
- [x] T007 [US1] Implement iframe load detection in src/content/floating-window.ts: add onload handler, contentDocument access check after load, and a 3-second timeout fallback. While loading, show the loading spinner. On embed failure (timeout or contentDocument null), show the fallback message with an "Open in New Tab" button (FR-011)
- [x] T008 [US1] Implement browser window resize handler in src/content/floating-window.ts that listens for window resize events and repositions/resizes the floating window to maintain 85% proportion and center alignment (FR-010)
- [ ] T009 [US1] Verify end-to-end: run `bun run build`, reload extension in Chrome, navigate to a page with links, Shift+Cmd+Click a link, confirm floating window appears centered with blurred backdrop and loads the page

**Checkpoint**: Core floating window works — Shift+Cmd+Click opens a centered iframe overlay with frosted glass backdrop

---

## Phase 4: User Story 2 - Close Floating Window (Priority: P2)

**Goal**: Users can close the floating window by pressing Esc or clicking a close button

**Independent Test**: Open a floating window, press Esc, verify it closes. Open again, click close button, verify it closes. Verify Esc does nothing when no window is open.

### Implementation for User Story 2

- [x] T010 [US2] Add Esc key listener in src/content/content.ts that calls removeFloatingWindow() when a floating window is open, and does nothing when no window is open (FR-006)
- [x] T011 [US2] Add close button click handler in src/content/floating-window.ts that calls removeFloatingWindow() when the close button in the toolbar is clicked (FR-007). Ensure removeFloatingWindow() also removes the backdrop and restores page interactivity.

**Checkpoint**: Floating window can be opened and closed via Esc or close button

---

## Phase 5: User Story 3 - Floating Window Toolbar (Priority: P3)

**Goal**: Toolbar displays the current URL, a close button, and a promote-to-tab button

**Independent Test**: Open a floating window, verify toolbar shows correct URL and both buttons are visible and styled

### Implementation for User Story 3

- [x] T012 [US3] Create toolbar module in src/content/toolbar.ts that builds the toolbar DOM: a read-only address bar displaying the current URL, a close button (X icon or label), and a promote-to-tab button (external link icon or label). Export createToolbar(url, onClose, onPromote) returning the toolbar element.
- [x] T013 [US3] Integrate toolbar into floating window in src/content/floating-window.ts: call createToolbar() when building the floating window DOM, pass removeFloatingWindow as onClose callback, and wire onPromote to send PROMOTE_TO_TAB message (placeholder until US4 implements the handler)
- [ ] T014 [US3] Implement URL tracking in src/content/floating-window.ts: when the iframe navigates internally, detect URL changes and update the toolbar address bar to reflect the current URL (FR-013). Use iframe load events to detect navigation.

**Checkpoint**: Toolbar shows URL, close button works, promote button is wired (actual tab creation in US4)

---

## Phase 6: User Story 4 - Promote to New Tab (Priority: P4)

**Goal**: Clicking promote-to-tab opens the current URL in a new tab with focus, and closes the floating window

**Independent Test**: Open a floating window, click promote-to-tab, verify new tab opens with same URL, focus moves to new tab, floating window closes

### Implementation for User Story 4

- [x] T015 [US4] Implement PROMOTE_TO_TAB message handler in src/background/service-worker.ts that listens for the message, calls chrome.tabs.create({url, active: true}) to open a new focused tab, and sends TAB_CREATED response back to the content script (FR-008)
- [x] T016 [US4] Implement promote-to-tab flow in src/content/content.ts: when the toolbar onPromote callback fires, send PROMOTE_TO_TAB message with current iframe URL to the service worker via chrome.runtime.sendMessage, then on TAB_CREATED response call removeFloatingWindow()

**Checkpoint**: Full promote-to-tab flow works end-to-end

---

## Phase 7: User Story 5 - Resize Floating Window (from FR-016, FR-017)

**Goal**: Users can resize the floating window, and resizing removes the blurred backdrop

**Independent Test**: Open a floating window, resize it by dragging an edge/corner, verify backdrop blur disappears and underlying page becomes visible

### Implementation for User Story 5

- [x] T017 [US5] Add resize capability to the floating window in src/content/floating-window.ts: apply CSS `resize: both` and `overflow: auto` to the window container. Add a ResizeObserver that detects when the user resizes the window and removes the backdrop blur by setting backdrop-filter to none and background to transparent on the backdrop element (FR-017).
- [x] T018 [US5] Handle re-trigger after resize in src/content/floating-window.ts: when a new Shift+Cmd+Click occurs while a resized window is open (FR-009), reset the window to centered 85% size and restore the blurred backdrop before navigating to the new URL

**Checkpoint**: Floating window is resizable, backdrop disappears on resize, re-trigger resets to default

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements across the feature

- [ ] T019 Run Biome lint and format across all source files in src/content/, src/shared/, and src/background/, fix any issues
- [ ] T020 Verify the single-window constraint: confirm that Shift+Cmd+Clicking a second link navigates the existing floating window instead of creating a second one (FR-009)
- [ ] T021 Validate production build (`bun run build:prod`) produces a working extension with all content script files included
- [ ] T022 Run quickstart.md validation: follow the testing guide in specs/002-floating-link-preview/quickstart.md and verify all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 depends on US1 (need a floating window to close)
  - US3 depends on US1 (need a floating window for the toolbar)
  - US4 depends on US3 (promote button is created in toolbar)
  - US5 depends on US1 (need a floating window to resize)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on US1 (floating window must exist to close it)
- **User Story 3 (P3)**: Depends on US1 (toolbar is part of floating window)
- **User Story 4 (P4)**: Depends on US3 (promote button is in toolbar)
- **User Story 5 (resize)**: Depends on US1 (floating window must exist to resize). Can run in parallel with US2/US3/US4.

### Within Each User Story

- Tasks marked [P] within a story can run in parallel
- Sequential tasks depend on prior tasks in the same story

### Parallel Opportunities

- T002 can run in parallel with T001 and T003 (Phase 1)
- US5 (Phase 7) can run in parallel with US3/US4 after US1 completes
- T019 tasks can run in parallel (different directories)

---

## Parallel Example: Phase 1 Setup

```bash
# T001 and T002 can run in parallel (different files):
Task: "Update manifest.json with content_scripts in static/manifest.json"
Task: "Create message type definitions in src/shared/messages.ts"

# T003 depends on T001 (needs to know entry point):
Task: "Update build script in src/build.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T009)
4. **STOP and VALIDATE**: Shift+Cmd+Click opens floating window with blurred backdrop
5. This is a functional floating link preview (close via page navigation)

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. User Story 1 → Floating window opens with iframe + backdrop (MVP!)
3. User Story 2 → Close via Esc and close button
4. User Story 3 → Toolbar with URL and action buttons
5. User Story 4 → Promote to new tab
6. User Story 5 → Resizable window, backdrop removal
7. Polish → Lint, production build, full validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 22 tasks across 8 phases
