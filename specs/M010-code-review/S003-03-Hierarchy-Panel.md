# S003-03-Hierarchy Panel: Component Extraction

Conform to `docs/principles.md`.

## Summary

Extract the hierarchy panel (inline layout panel) into a dedicated component to reduce board template size without changing behavior.

## Goal

Isolate the hierarchy panel UI and interactions into a focused component while preserving all current UX and data flow.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for extraction.
-   Refactoring services, routing, or data models.

## Definition of Done

-   [ ] The inline `.board-hierarchy` block in `client/src/app/board/board.component.html` is moved into its own component and renders identically.
-   [ ] Existing `data-testid` attributes and DOM structure are preserved.
-   [ ] Panel actions (toggle edit, parent menu, reorder) behave the same as before.
-   [ ] Extracted component is `standalone: true` if it declares `imports`.
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   This spec targets the inline hierarchy panel within the main board layout, not the drawer variant.
-   Keep diffs focused on extraction; avoid unrelated refactors.
-   Follow the "Component refactor checklist" in `docs/learning.md`.
