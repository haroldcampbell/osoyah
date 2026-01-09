# S003-00-UI Component Extraction: Large Board Views

Conform to `docs/principles.md`.

## Summary

Extract the largest UI blocks from the board view into dedicated components (list view and board canvas/card view) to reduce template size and improve maintainability without changing behavior.

## Goal

Make the board UI easier to reason about by isolating large template sections into focused components while preserving all existing interactions and layout.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for extraction.
-   Refactoring services, routing, or data models.

## Definition of Done

-   [x] The list view block (`.board-list-view` in `client/src/app/board/board.component.html`) is moved into its own component and renders identically.
-   [x] The main board canvas/card view block (the list columns with the `cdkDropList` for lists) is moved into its own component and renders identically.
-   [x] Extracted components are `standalone: true` if they declare `imports`.
-   [x] Drag-and-drop, selection, and panel interactions behave the same as before.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   Preserve existing `data-testid` attributes and DOM structure as much as possible to avoid test regressions.
-   Keep diffs focused on extraction; avoid unrelated refactors.
