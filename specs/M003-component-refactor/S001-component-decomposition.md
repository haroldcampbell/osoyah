# S001-Component Decomposition: Board → List + Card

Conform to `docs/principles.md`.

## Summary
Split the existing board UI into `ListComponent` and `CardComponent` with clear ownership boundaries.

## Goal
Improve readability and maintainability without changing current behavior.

## Non-goals
- Feature changes or UI redesigns.
- State model changes beyond component boundaries.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes with new component specs.

## Notes (edge cases, hazards, perf constraints)
- Keep list drag-and-drop ownership in the board/list boundary.
- Keep card drag-and-drop within list boundaries.
- Preserve mock data loading and in-memory state.
