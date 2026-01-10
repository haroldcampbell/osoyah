# S003-01-Board Toolbar: Component Extraction

Conform to `docs/principles.md`.

## Summary

Extract the board toolbar block into a dedicated component to reduce board template size without changing behavior.

## Goal

Isolate the board toolbar UI and interactions into a focused component while preserving all current UX and data flow.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for extraction.
-   Refactoring services, routing, or data models.

## Definition of Done

-   [x] The `.board-toolbar` block in `client/src/app/board/board.component.html` is moved into its own component and renders identically.
-   [x] Existing `data-testid` attributes and DOM structure are preserved.
-   [x] Toolbar actions (view toggles, add list, settings) behave the same as before.
-   [x] Extracted component is `standalone: true` if it declares `imports`.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   Keep diffs focused on extraction; avoid unrelated refactors.
