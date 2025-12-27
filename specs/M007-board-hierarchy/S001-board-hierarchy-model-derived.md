# S001-Board Hierarchy Model (Derived): Link Metadata

Conform to `docs/principles.md`.

## Summary
Define how boards link into a hierarchy without introducing a new project entity.

## Goal
Provide a simple, explicit metadata structure for Goals > Initiatives > Teams > Tasks.

## Non-goals
- Persisting hierarchy in a backend.
- Automatic inference of hierarchy from card relationships.

## Definition of Done
- [ ] Board data can express parent/child board links.
- [ ] A board can have at most one parent in the hierarchy.
- [ ] Mock data includes a sample Goals > Initiatives > Teams > Tasks chain.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Hierarchy is derived from explicit links rather than new entities.
