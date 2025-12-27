# S002-Relationship Integrity: Safety Rules

Conform to `docs/principles.md`.

## Summary
Define integrity rules for parent/child links to prevent cycles and enforce the single-parent constraint.

## Goal
Ensure relationships remain predictable and easy to reason about.

## Non-goals
- Cross-workspace or permission boundaries.
- Bulk relationship operations.

## Definition of Done
- [ ] Cycles are prevented (a card cannot be its own ancestor).
- [ ] Each card enforces a single parent.
- [ ] Deleting a parent severs child links with a safe fallback.
- [ ] UI messaging explains blocked relationship changes.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Prefer warnings and safe unlinking over hard failures.
