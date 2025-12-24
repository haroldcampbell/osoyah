# S010-[Nice-to-Have] Activity Indicators: Last Updated

Conform to `principles.md`.

## Summary
Surface lightweight activity indicators on cards (e.g., "edited" badge or last-updated time).

## Goal
Help teams scan for recently changed work.

## Non-goals
- Full activity feed or audit log.
- Multi-user attribution.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)
- Indicators should remain subtle to avoid clutter.
- Ensure indicators update when comments or descriptions change.
