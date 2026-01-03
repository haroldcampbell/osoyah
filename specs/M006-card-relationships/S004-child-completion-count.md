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

- [ ] Card model includes a non-system `status` field with `state` and `completedAt`.
- [ ] Status defaults to incomplete and can be toggled complete/incomplete in the UI.
- [ ] Parent cards display a `completed/total` child count when they have children.
- [ ] Completed count only includes children with `status.state = 'completed'`.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- `completedAt` clears when a card is set back to incomplete.
- Keep the progress indicator subtle to avoid visual clutter.
