# S002-Workspace Card Identity: Monotonic IDs

Conform to `docs/principles.md`.

## Summary
Assign a monotonically increasing card ID per workspace so cards are easy to reference across boards, projects, and collections.

## Goal
Users can reference a card as “#123” within a workspace and trust that it is unique, stable, and searchable.

## Non-goals
- Global IDs across all workspaces.
- Exposing internal database IDs.
- Automatic renumbering during imports.

## Definition of Done
- [ ] Each workspace maintains a monotonically increasing card counter.
- [ ] New cards receive the next workspace ID regardless of board/collection.
- [ ] Card IDs are immutable after creation.
- [ ] Card IDs are displayed in card list rows and detail headers.
- [ ] Search supports workspace ID lookup (e.g., “#123”).
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - UI shows card IDs in list rows and detail headers.
  - Search UI recognizes “#<id>” and highlights the match.
- `npm run e2e`
  - Creating cards on two boards increments IDs sequentially.
  - Moving a card across boards does not change its ID.

## Notes (edge cases, hazards, perf constraints)
- If a card is deleted, its ID is not reused.
- Imports should allocate new workspace IDs to avoid collisions.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
