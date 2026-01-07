# S001-Roll-Up Metrics (Board + Descendants): Default Mode

Conform to `docs/principles.md`.

## Summary
Add roll-up metrics that aggregate cards on the current board and its descendants.

## Goal
Provide meaningful progress signals based on board membership and descendants.

## Non-goals
- Historical trend visualization.

## Definition of Done
- [x] Roll-ups aggregate cards on the board (direct) and on descendant boards (descendants).
- [x] Roll-ups are produced by a service that ingests roll-up configuration settings.
- [x] Roll-ups display total cards and completed cards derived from config.
- [x] Roll-ups are visible from the hierarchy view and toggled on in board settings.
- [x] Metrics use large centered numbers with smaller labels in rounded boxes.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Roll-up configuration settings model future customization (e.g., different properties/filters).
