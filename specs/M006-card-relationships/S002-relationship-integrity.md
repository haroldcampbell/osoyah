# S002-Relationship Integrity: Safety Rules

Conform to `docs/principles.md`.

## Summary
Enforce single-parent and cycle prevention rules in the BoardService and UI, while recording relationship changes as system comments with author-type flags.

## Goal
Ensure relationships remain predictable and easy to reason about.

## Non-goals
- Cross-workspace or permission boundaries.
- Bulk relationship operations.

## Definition of Done
- [x] Cycles are prevented (a card cannot be its own ancestor).
- [x] Each card enforces a single parent.
- [x] Deleting a parent severs child links with a safe fallback (children become unlinked).
- [x] System comments are added when relationships are linked/unlinked or removed due to deletion on both parent and child cards.
- [x] System comments use bold, clickable card labels that deep-link to the related card when available.
- [x] UI messaging explains blocked relationship changes.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Prefer warnings and safe unlinking over hard failures.
- Block invalid parent selections in the UI (self/ancestor relationships).
- Store comment author type (`user`, `system`, `bot`) to distinguish activity posts.
- System comment templates:
  - `Parent card linked: **<card-id> - <card-title>**` (link when possible)
  - `Parent card unlinked: **<card-id> - <card-title>**` (link when possible)
  - `Child card linked: **<card-id> - <card-title>**` (link when possible)
  - `Child card unlinked: **<card-id> - <card-title>**` (link when possible)
