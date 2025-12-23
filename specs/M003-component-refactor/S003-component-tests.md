# S003-Component Tests: List + Card

Conform to `principles.md`.

## Summary
Add unit coverage for the new list and card components.

## Goal
Protect core list/card behavior through unit tests.

## Non-goals
- Expanding E2E coverage beyond existing flows.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run test` passes with new component tests.

## Notes (edge cases, hazards, perf constraints)
- Test behavior, not implementation details.
- Keep tests deterministic and focused on core CRUD flows.
