# S010-[Nice-to-Have] Activity Indicators: Last Updated

Conform to `docs/principles.md`.

## Summary
Surface lightweight activity indicators on cards (e.g., "edited" badge or last-updated time).

## Goal
Help teams scan for recently changed work.

## Non-goals
- Full activity feed or audit log.
- Multi-user attribution.

## Definition of Done
- [ ] Cards show a subtle activity indicator (badge or last-updated time).
- [ ] Indicators update when comments or descriptions change.
- [ ] Indicators remain subtle to avoid clutter.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
