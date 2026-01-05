# S004-Child Completion Count: Progress Signal

Conform to `docs/principles.md`.

## Summary
Track completion status on cards and show a compact count of completed children on parent cards.

## Goal
Give parent cards a quick progress signal without expanding the full child list.

## Non-goals

- Board-level rollups (handled in M008).
- Automated completion rules or workflow states.
- Historical completion audit log.

## Definition of Done

- [x] Card model includes a non-system `status` field with `state` and `completedAt`.
- [x] Status defaults to incomplete and can be toggled complete/incomplete in the UI.
- [x] List model includes an `isProcessDone` boolean to mark completion lists.
- [x] Moving a card into a done list marks it complete; moving out resets it and logs a system comment.
- [x] Marking a card done from the panel moves it into the board’s done list when available.
- [x] Parent cards display a `completed/total` child count when they have children.
- [x] Completed count only includes children with `status.state = 'completed'`.
- [x] Parent cards show a segment bar footer on the board and a compact progress row in the card panel.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- `completedAt` clears when a card is set back to incomplete.
- Keep the progress indicator subtle to avoid visual clutter.
