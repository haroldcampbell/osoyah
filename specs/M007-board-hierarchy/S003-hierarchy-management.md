# S003-Hierarchy Management: Link Editing

Conform to `docs/principles.md`.

## Summary
Provide UI to attach/detach boards within the hierarchy and reorder sibling boards.

## Why
Hierarchy edits need to be quick and visible while users navigate boards. Keeping management in the
sidebar and supporting safe reordering lets users shape the tree without leaving context or risking
accidental cycles.

## Goal
Allow users to manage the board tree without a new project entity.

## Non-goals
- Bulk hierarchy edits.
- Import/export of hierarchy configuration.

## Definition of Done
- [x] Users can set a parent board for the current board.
- [x] Users can reorder boards within the same parent.
- [x] Removing a parent link leaves the board accessible.
- [x] UI indicates when a change is not allowed.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Limit hierarchy depth to the current mock data levels.
