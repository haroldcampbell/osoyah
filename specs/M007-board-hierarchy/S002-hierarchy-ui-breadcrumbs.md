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
- [ ] Left panel renders the board hierarchy tree.
- [ ] Top breadcrumb bar shows current path and supports navigation.
- [ ] Hierarchy UI is visible on boards that are linked into the tree.
- [ ] UI remains usable on narrow viewports.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Mockup: `designs/mockups/M007-S002-hierarchy-ui-breadcrumbs.svg`.
