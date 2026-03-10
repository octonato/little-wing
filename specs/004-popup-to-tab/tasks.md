# Tasks: Popup-to-Tab Keyboard Shortcut

**Input**: Design documents from `/specs/004-popup-to-tab/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not requested — manual testing only (Chrome extension loaded unpacked).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - Promote Popup to Tab via Keyboard (Priority: P1) 🎯 MVP

**Goal**: Add Cmd+T (macOS) / Ctrl+T (other platforms) keyboard shortcut in popup windows to promote the popup to a regular browser tab.

**Independent Test**: Open a floating popup with Shift+Cmd+Click on any link, press Cmd+T in the popup window. The popup should close and the page should appear as a new tab in the parent window. Verify Cmd+T on a regular page still opens a new browser tab.

### Implementation for User Story 1

- [x] T001 [US1] Add platform-aware Cmd+T / Ctrl+T keydown listener with boolean guard in `setupPopupControls()` in src/content/content.ts. The listener must: detect macOS via `navigator.platform`, check `event.metaKey` (macOS) or `event.ctrlKey` (other) with `event.key === "t"`, call `event.preventDefault()` to suppress browser default, use a boolean `isPromoting` guard to prevent duplicate sends, and send the existing `PromoteToTabRequest` message via `chrome.runtime.sendMessage`. Place the new listener alongside the existing Esc keydown handler.

**Checkpoint**: User Story 1 is complete. Cmd+T promotes popup to tab. Existing Esc-to-close and floating button remain functional.

---

## Phase 2: User Story 2 - Keyboard Shortcut Coexists with Button (Priority: P2)

**Goal**: Verify the existing floating "Open in Tab" button continues to work unchanged alongside the new keyboard shortcut.

**Independent Test**: Open a floating popup, click the "Open in Tab" button — it should promote to tab. Open another popup, press Cmd+T — it should also promote to tab. Both methods use the same `PROMOTE_TO_TAB` message.

### Implementation for User Story 2

- [x] T002 [US2] Verify no regressions to the existing floating button in src/content/content.ts. The button's click handler must remain unchanged and still send `PromoteToTabRequest`. No code changes expected — this is a verification task. If the boolean `isPromoting` guard from T001 could block the button (it should not, since button click and keydown are separate code paths), ensure they are independent.

**Checkpoint**: Both Cmd+T shortcut and floating button independently promote popup to tab.

---

## Phase 3: Polish & Cross-Cutting Concerns

- [x] T003 Build the extension with `bun run build` and verify no TypeScript or lint errors
- [ ] T004 Manual end-to-end validation (USER): load unpacked extension, test all three acceptance scenarios from spec (Cmd+T in popup, focus transfer, Cmd+T on regular page), test edge cases (rapid presses, Esc still works)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies — can start immediately (single file edit)
- **Phase 2 (US2)**: Depends on Phase 1 — verification of coexistence
- **Phase 3 (Polish)**: Depends on Phase 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — standalone implementation
- **User Story 2 (P2)**: Depends on US1 being implemented — verification only, no new code expected

### Parallel Opportunities

- T003 and T004 can run in parallel after T001 is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Add Cmd+T keydown listener
2. **STOP and VALIDATE**: Build and test manually
3. Feature is functional after a single task

### Incremental Delivery

1. T001 → Cmd+T shortcut works (MVP!)
2. T002 → Verify button still works (regression check)
3. T003 + T004 → Build validation and end-to-end testing

---

## Notes

- This feature is a single-file, single-function change (~10 lines of code)
- No new files, no new message types, no service worker changes
- The `isPromoting` boolean guard handles the rapid-press edge case
- Platform detection (`navigator.platform.includes("Mac")`) determines Cmd vs Ctrl
- The existing `setupPopupControls()` already handles popup-only scoping — the shortcut listener is only attached inside popup windows
