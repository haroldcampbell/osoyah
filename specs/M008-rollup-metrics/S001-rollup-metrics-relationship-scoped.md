# S001-Roll-Up Metrics (Relationship-Scoped): Default Mode

Conform to `docs/principles.md`.

## Summary
Add roll-up metrics that aggregate cards whose parents live within the selected hierarchy subtree.

## Goal
Provide meaningful progress signals without counting unrelated cards.

## Non-goals
- Direct-membership or subtree-wide roll-ups (future experiments).
- Historical trend visualization.

## Definition of Done
- [ ] Roll-ups aggregate only cards linked by parent/child relationships in the subtree.
- [ ] Roll-ups display counts by state (e.g., open vs completed).
- [ ] Roll-ups are visible from the hierarchy view.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Parent/child links can cross boards; aggregation follows links, not board membership.
