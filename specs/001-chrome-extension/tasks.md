# Tasks: Chrome Extension Project Setup

**Input**: Design documents from `/specs/001-chrome-extension/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not explicitly requested in the feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and configuration

- [x] T001 Initialize Bun project with `bun init` and configure package.json with name "little-wing", scripts for build, dev, build:prod, lint, lint:fix, and format in package.json
- [x] T002 Configure TypeScript strict mode with Chrome extension-compatible settings (ES2022 target, module: ESNext, strict: true, no implicit any) in tsconfig.json
- [x] T003 [P] Install and configure Biome for linting and formatting with TypeScript rules in biome.json
- [x] T004 [P] Add dist/ to .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build system and manifest that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Chrome Extension Manifest V3 file with required fields (name: "Little Wing", version: "0.1.0", manifest_version: 3, description, action.default_popup, background.service_worker) in static/manifest.json
- [x] T006 Implement build script using Bun.build() API that bundles TypeScript entry points (src/popup/popup.ts, src/background/service-worker.ts) to dist/, copies static/manifest.json and src/popup/popup.html to dist/ in src/build.ts
- [x] T007 Add production build mode to the build script that builds with minification (separate Bun.build() calls per entry point to avoid multi-entry minification bug) in src/build.ts

**Checkpoint**: Build system ready — running `bun run build` produces a valid extension bundle in dist/

---

## Phase 3: User Story 1 - Initialize Extension Project Structure (Priority: P1) 🎯 MVP

**Goal**: A fully scaffolded Chrome extension that can be loaded as an unpacked extension in Chrome

**Independent Test**: Run `bun run build`, load `dist/` as unpacked extension in Chrome, verify it appears in `chrome://extensions` without errors

### Implementation for User Story 1

- [x] T008 [P] [US1] Create popup HTML page with basic structure, a script tag referencing popup.js, and placeholder content ("Little Wing Extension") in src/popup/popup.html
- [x] T009 [P] [US1] Create popup TypeScript entry point that logs initialization to console in src/popup/popup.ts
- [x] T010 [P] [US1] Create background service worker entry point that logs activation to console and listens for the install event in src/background/service-worker.ts
- [x] T011 [US1] Verify end-to-end: run `bun run build`, confirm dist/ contains manifest.json, popup/popup.html, popup/popup.js, background/service-worker.js, and all files are valid

**Checkpoint**: Extension can be loaded in Chrome as unpacked extension, icon appears in toolbar, no console errors

---

## Phase 4: User Story 2 - Development Workflow with Hot Reload (Priority: P2)

**Goal**: A dev mode that watches source files and automatically rebuilds the extension on changes

**Independent Test**: Run `bun run dev`, modify a source file, verify dist/ is rebuilt within a few seconds

### Implementation for User Story 2

- [x] T012 [US2] Add watch mode to build script that re-runs the build on source file changes using Bun's `--watch` flag, wire to `bun run dev` script in package.json and src/build.ts

**Checkpoint**: Running `bun run dev` watches for changes and rebuilds automatically

---

## Phase 5: User Story 3 - Extension Popup Page (Priority: P3)

**Goal**: A working popup that appears when clicking the extension icon with styled placeholder content

**Independent Test**: Click extension icon in Chrome toolbar, verify popup appears with styled content

### Implementation for User Story 3

- [ ] T013 [P] [US3] Enhance popup HTML with basic styling (inline or linked CSS), a heading, and descriptive placeholder text in src/popup/popup.html
- [ ] T014 [P] [US3] Add interactive behavior to popup (e.g., display extension version from manifest, show a status message) in src/popup/popup.ts

**Checkpoint**: Clicking extension icon shows a styled popup with placeholder content

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the overall project quality

- [ ] T015 Run Biome lint and format across all source files, fix any issues
- [ ] T016 Validate the production build (`bun run build:prod`) produces a minified, loadable extension bundle
- [ ] T017 Run quickstart.md validation: follow the quickstart guide from scratch and verify all steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 must complete before US3 (popup enhancement depends on base popup existing)
  - US2 is independent of US1 and US3
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Independent of US1 and US3
- **User Story 3 (P3)**: Depends on US1 (enhances the popup created in US1)

### Within Each User Story

- Tasks marked [P] within a story can run in parallel
- Sequential tasks depend on prior tasks in the same story

### Parallel Opportunities

- T003 and T004 can run in parallel (Phase 1)
- T008, T009, and T010 can run in parallel (Phase 3, US1)
- T013 and T014 can run in parallel (Phase 5, US3)
- US2 (Phase 4) can run in parallel with US1 (Phase 3) since watch mode is independent

---

## Parallel Example: User Story 1

```bash
# Launch all entry point files together:
Task: "Create popup HTML page in src/popup/popup.html"
Task: "Create popup TypeScript entry point in src/popup/popup.ts"
Task: "Create background service worker in src/background/service-worker.ts"

# Then verify end-to-end (sequential, depends on above):
Task: "Verify end-to-end build produces valid extension bundle"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: User Story 1 (T008–T011)
4. **STOP and VALIDATE**: Load extension in Chrome, verify it works
5. This is a fully functional, loadable Chrome extension

### Incremental Delivery

1. Setup + Foundational → Build system ready
2. User Story 1 → Loadable extension in Chrome (MVP!)
3. User Story 2 → Dev workflow with watch mode
4. User Story 3 → Polished popup UI
5. Polish → Lint clean, production build validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 17 tasks across 6 phases
