# S002-Card Ownership Model: Assignees + Accountability

Conform to `docs/principles.md`.

## Summary
Introduce an explicit card ownership field so responsibility is clear and downstream trust/risk features have a stable signal.

## Goal
Every card can have a single owner (or be explicitly unassigned) with predictable UI and API behavior.

## Non-goals
- Multiple assignees per card.
- Advanced assignment rules or automation.
- Permission changes based on ownership.

## Definition of Done
- [ ] Card model includes `owner_id` (nullable) referencing a workspace member.
- [ ] Card detail UI supports assigning and unassigning an owner.
- [ ] Unassigned cards display a clear “No owner” state.
- [ ] Acceptance tests pass.

## Dependencies
- M-diff-000-S001 (Organization + Workspace Model)

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Card detail UI shows owner selection and “No owner”.
- `npm run e2e`
  - Assigning and clearing an owner updates the card state.

## Notes (edge cases, hazards, perf constraints)
- Avoid defaulting owners silently; require explicit action.
- Ownership changes should update `updatedAt`.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
