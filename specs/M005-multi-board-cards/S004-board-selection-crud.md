# S004-Board Selection + CRUD: Multi-Board Management

Conform to `docs/principles.md`.

## Summary
Add board selection plus basic create/rename/delete flows so users can manage multiple boards in the UI.

## Goal
Let users switch between boards and maintain simple board management without backend persistence.

## Non-goals
- Backend persistence or multi-user collaboration.
- Board hierarchy or roll-ups (handled in later milestones).
- Bulk board operations.

## Definition of Done
- [ ] Users can switch the active board from a visible selector.
- [ ] Users can create a new board with a name.
- [ ] Users can rename an existing board.
- [ ] Users can delete a board with a basic safeguard (confirm or undo).
- [ ] Board deletion removes memberships on that board without deleting global card data.
- [ ] Existing single-board flows continue to work.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Decide where the board selector lives and keep the UI predictable across viewports.
- Add E2E coverage for switching boards and verifying shared card membership once the selector exists.
