# S002-Hierarchy UI + Breadcrumbs: Tree Navigation

Conform to `docs/principles.md`.

## Summary
Add a left-side hierarchy panel and top breadcrumb bar to navigate the board tree.

## Goal
Enable fast jumps across Goals > Initiatives > Teams > Tasks while staying on a board.

## Non-goals
- Card-level hierarchy indicators.
- Roll-up metrics in this view.

## Definition of Done
- [x] Left panel renders the board hierarchy tree.
- [x] Top breadcrumb bar shows current path and supports navigation.
- [x] Hierarchy UI is visible on boards that are linked into the tree.
- [x] Boards outside the hierarchy show an empty state with a management CTA and an option to collapse the hierarchy panel.
- [x] UI remains usable on narrow viewports.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Mockup: `designs/mockups/M007-S002-hierarchy-ui-breadcrumbs.excalidraw`.
- Tree ordering follows the raw order of `boardRelationships` (no sorting).
- Tree renders all roots (full forest), not just the current board’s subtree.
- Option B (alternate): render only the subtree containing the current board (single-root view).
- Breadcrumbs are derived by walking parents to the root and include the current board as the final crumb.
- Narrow viewports collapse the hierarchy tree into a toggle; the breadcrumb bar stays visible and the tree opens as an overlay drawer.
