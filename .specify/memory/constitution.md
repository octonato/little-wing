<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial adoption)
  Modified principles: N/A (first version)
  Added sections:
    - Core Principles (5 principles)
    - Code Quality Standards
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ no update needed (Constitution Check is generic)
    - .specify/templates/spec-template.md — ✅ no update needed (requirements structure compatible)
    - .specify/templates/tasks-template.md — ✅ no update needed (phase structure compatible)
  Follow-up TODOs: None
-->

# Little Wing Constitution

## Core Principles

### I. Single Responsibility

Every module, class, and function MUST have exactly one reason to change.
Responsibilities MUST be identified and documented before implementation begins.

- One file MUST NOT mix unrelated concerns (e.g., data access and presentation logic).
- When a module grows beyond its original responsibility, it MUST be split.
- Rationale: Single responsibility is the foundation of maintainable code. Violations compound into tangled dependencies that resist change.

### II. Clean Boundaries

Components MUST communicate through well-defined interfaces, not implementation details.

- Public APIs MUST be minimal — expose only what consumers need.
- Dependencies MUST flow inward: higher-level policy MUST NOT depend on lower-level detail.
- External dependencies (databases, APIs, frameworks) MUST be isolated behind abstractions so they can be replaced without cascading changes.
- Rationale: Clean boundaries make components independently testable, replaceable, and comprehensible.

### III. Meaningful Naming

All identifiers — variables, functions, types, files — MUST clearly convey intent.

- Names MUST describe *what* something does or represents, not *how*.
- Avoid abbreviations unless they are universally understood in the domain.
- Naming inconsistencies MUST be treated as bugs and fixed immediately.
- Rationale: Code is read far more than it is written. Clear names eliminate the need for explanatory comments and reduce onboarding friction.

### IV. Simplicity First

The simplest solution that meets requirements MUST be preferred.

- No speculative abstractions: code MUST solve current requirements, not hypothetical future ones (YAGNI).
- Indirection MUST be justified by a concrete, present-day need.
- Duplication is acceptable when the alternative is a premature abstraction — extract only when a pattern is confirmed across three or more occurrences.
- Rationale: Unnecessary complexity is the primary source of defects and slow iteration. Simplicity preserves the team's ability to move fast.

### V. Testability by Design

Code MUST be structured so that each unit of responsibility can be tested in isolation.

- Pure logic MUST be separable from side effects (I/O, network, filesystem).
- Test setup that requires more than a few lines of boilerplate indicates a design problem — refactor the production code, not the test.
- Untestable code MUST NOT be merged.
- Rationale: If code cannot be tested in isolation, its responsibilities are entangled. Testability is a direct measure of design quality.

## Code Quality Standards

- Functions SHOULD be short enough to fit on one screen (~30 lines). Longer functions MUST be justified.
- Nesting depth beyond 2 levels MUST trigger extraction into a named helper.
- Dead code, commented-out code, and TODO comments without linked issues MUST be removed before merge.
- Error handling MUST be explicit — silent failures are prohibited.

## Development Workflow

- Each pull request MUST address a single concern (feature, fix, or refactor — not a mix).
- Refactoring MUST be done in dedicated commits, separate from behavioral changes.
- Code review MUST verify adherence to constitution principles before approving.

## Governance

This constitution is the authoritative source for code quality and design standards in the Little Wing project. All code contributions MUST comply with the principles defined here.

- **Amendments**: Any change to this constitution MUST be documented with a version bump, rationale, and migration plan for existing code that violates new rules.
- **Versioning**: MAJOR for principle removals or redefinitions, MINOR for new principles or expanded guidance, PATCH for wording and clarification fixes.
- **Compliance**: Code reviews MUST include a constitution compliance check. Violations MUST be resolved before merge or explicitly documented with justification.

**Version**: 1.0.0 | **Ratified**: 2026-03-09 | **Last Amended**: 2026-03-09
