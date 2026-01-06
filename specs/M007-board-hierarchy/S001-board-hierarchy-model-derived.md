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
- [x] Board data can express parent/child board links.
- [x] A board can have at most one parent in the hierarchy.
- [x] Hierarchy links are cycle-free (constraint documented here; enforcement handled in S003).
- [x] Mock data includes a sample Goals > Initiatives > Teams > Tasks chain.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Hierarchy is derived from explicit links rather than new entities.
- Store hierarchy links in a separate collection (e.g., `boardRelationships`) using `parentBoardId`, `childBoardId`, and `createdAt`.
- Future idea: multi-parent boards as an optional workspace setting (see `specs/Ideas/frontend/M-future-006-multi-parent-board-hierarchy/board-hierarchy-multi-parent.md` for rationale and UX considerations).
