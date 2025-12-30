# S002-Capacity Snapshot: Overload Signals

Conform to `docs/principles.md`.

## Summary
Provide a lightweight capacity view that shows who is overloaded this week using simple signals (assigned tasks due soon, WIP limits, blocked items).

## Goal
Make overload visible and actionable without requiring time tracking or story points.

## Non-goals
- Utilization reporting.
- Time tracking.
- Automatic reassignment.

## Dependencies
- M-diff-000-S002 (Card Ownership Model)
- M-diff-000-S003 (Card Due Dates)

## Definition of Done
- [ ] Capacity view shows per-user load with reasons.
- [ ] Load is a simple scalar (0-100) derived from transparent rules.
- [ ] Clicking a reason drills into the exact tasks.
- [ ] UI handles loading/empty/error states.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Capacity view renders per-user load and reasons.
  - Drill-down shows the precise tasks.
- `npm run e2e`
  - A user with 7 due tasks this week shows elevated load.
  - Clearing blockers reduces load.

## Notes (edge cases, hazards, perf constraints)
- Keep the rules explainable; avoid hidden weighting.
- Compute incrementally from task deltas.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
