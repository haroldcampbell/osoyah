# M003-Component Refactor: Modular Kanban UI

Conform to `docs/principles.md`.

## Summary
Refactor the M002 board UI into modular Angular components with shared SCSS tokens, preserving existing behavior and tests while improving maintainability.

## Goal
Ship a more modular board (list + card components) and shared styling primitives without changing functionality.

## Scope
In-scope:
- Extract list and card UI into focused Angular components with clear Inputs/Outputs.
- Introduce shared SCSS tokens for spacing, radii, colors, and button sizing.
- Update unit tests and E2E selectors as needed for the refactor.
Out-of-scope:
- New product features (permissions, realtime, persistence).
- Visual redesign beyond tokenization.

## Specs
- S001-Component Decomposition
- S002-Shared SCSS Tokens
- S003-Component Tests
- S004-E2E Regression
- S005-Standalone Components

## Notes
- Preserve mock data loading and in-memory state management.
- Keep drag-and-drop behavior aligned with Angular CDK patterns.
