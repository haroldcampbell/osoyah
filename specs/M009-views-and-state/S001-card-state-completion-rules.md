# S001-Card State + Completion Rules: Done Behavior

Conform to `docs/principles.md`.

## Summary
Add a card state (e.g., open/completed) and define how completion affects list placement.

## Goal
Make completion consistent with pipeline boards where lists represent stages.

## Non-goals
- Automated stage progression beyond completion.
- Reporting dashboards.

## Definition of Done
- [ ] Cards include a state field with at least open/completed.
- [ ] Marking complete updates state immediately.
- [ ] If a Done list is configured, completing a card moves it there.
- [ ] If no Done list is configured, completion does not move the card.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- State changes should not imply a primary board.
