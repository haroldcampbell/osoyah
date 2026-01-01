# S001-Parent/Child Links (Single Parent): Relationship Model

Conform to `docs/principles.md`.

## Summary
Add a parent reference to cards so each card may link to a single parent, including across boards.

## Goal
Represent card hierarchies while keeping boards and lists unchanged.

## Non-goals
- Multiple parents per card.
- Board hierarchy relationships.

## Definition of Done
- [x] Cards can reference a single parent card by ID.
- [x] Parent and child can live on different boards.
- [x] Existing card flows remain unchanged when no parent is set.
- [x] Mock data updated to include at least one cross-board parent/child example.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Parent reference should be nullable and safe when missing.
