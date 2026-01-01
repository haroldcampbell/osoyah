# S002-Board Activity Feed: Timeline + Filters

Conform to `docs/principles.md`.

## Summary
Add a board-level activity feed that presents recent card activity with filtering and deep links.

## Goal
Let users review what changed on a board without opening every card.

## Non-goals

- Realtime updates or multi-user presence.
- Cross-board aggregation.
- Infinite scroll or virtualization.

## Definition of Done

- [ ] Board header includes an Activity entry that opens the activity feed panel.
- [ ] Feed lists events newest-first with timestamp, summary text, and card link when available.
- [ ] Events are grouped by day with clear day headers.
- [ ] Filters allow narrowing by event type (move, comment, update, create).
- [ ] Empty state explains when no activity matches filters.
- [ ] Opening a feed item focuses the card and opens the card panel if available.
- [ ] Activity feed panel is responsive and usable on narrow viewports.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- If a card has been deleted, show the event but disable the link.
- Keep filters persistent per board using local storage.
