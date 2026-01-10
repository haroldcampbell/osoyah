# S003-04-Hierarchy Panel Drawer: Component Extraction

Conform to `docs/principles.md`.

## Summary

Extract the hierarchy panel drawer (overlay/drawer variant) into a dedicated component to reduce board template size without changing behavior.

## Goal

Isolate the hierarchy drawer UI and interactions into a focused component while preserving all current UX and data flow.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for extraction.
-   Refactoring services, routing, or data models.

## Definition of Done

-   [x] The drawer `.board-hierarchy` block in `client/src/app/board/board.component.html` (with `.board-hierarchy-drawer`) is moved into its own component and renders identically.
-   [x] Existing `data-testid` attributes and DOM structure are preserved.
-   [x] Drawer actions (toggle edit, parent menu, reorder) behave the same as before.
-   [x] Extracted component is `standalone: true` if it declares `imports`.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   This spec targets the drawer/overlay hierarchy panel variant.
-   Keep diffs focused on extraction; avoid unrelated refactors.
-   Follow the "Component refactor checklist" in `docs/learning.md`.
