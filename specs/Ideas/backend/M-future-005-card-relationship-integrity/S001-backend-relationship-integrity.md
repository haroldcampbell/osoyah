# S001-Backend Relationship Integrity

Conform to `docs/principles.md`.

## Summary
Add backend persistence rules to guarantee single-parent relationships and prevent cycles in card hierarchies.

## Goal
Enforce integrity at the database and API layers for parent/child links.

## Non-goals

- UI or client-side relationship creation flows.
- Multi-parent support.

## Definition of Done

- [ ] Define a relationship table with foreign keys to cards and a unique child constraint.
- [ ] Document or implement the cycle-prevention strategy (e.g., recursive check on insert/update).
- [ ] API validation rejects missing cards, duplicate parents, and cycles.
- [ ] Migration plan (or script) documented for existing data.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Backend test command(s) defined and documented before implementation.

## Notes (edge cases, hazards, perf constraints)

- Cycle checks must be bounded and deterministic.
- Ensure cross-board relationships are allowed; only card identity matters.
