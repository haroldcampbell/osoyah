# S003-Hierarchy Management: Link Editing

Conform to `docs/principles.md`.

## Summary
Provide UI to attach/detach boards within the hierarchy and reorder sibling boards.

## Goal
Allow users to manage the board tree without a new project entity.

## Non-goals
- Bulk hierarchy edits.
- Import/export of hierarchy configuration.

## Definition of Done
- [ ] Users can set a parent board for the current board.
- [ ] Users can reorder boards within the same parent.
- [ ] Removing a parent link leaves the board accessible.
- [ ] UI indicates when a change is not allowed.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Limit hierarchy depth to the current mock data levels.
