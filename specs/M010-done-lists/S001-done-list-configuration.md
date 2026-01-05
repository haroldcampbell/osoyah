# S001-Done List Configuration: Board-Level Done Lists

Conform to `docs/principles.md`.

## Summary
Add a board-level way to mark one or more lists as "done" so completion state stays consistent across lists.

## Goal
Let users define which lists should set a card to completed when it is moved into them.

## Non-goals

- Automatic list creation or workflow templating.
- Board-wide rollups outside of list completion signaling.
- Custom completion states beyond done/incomplete.

## Definition of Done

- [ ] Board settings include controls to toggle `isProcessDone` on lists.
- [ ] Multiple lists can be marked as done per board.
- [ ] List-level done configuration persists in mock data.
- [ ] Cards moved into done lists update `status.state = 'completed'` and set `completedAt`.
- [ ] Cards moved out of done lists reset to incomplete and clear `completedAt`.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- If a board has no done lists configured, card completion should only change via manual toggles.
