# S001-Configurable Completion Mapping: Done List

Conform to `docs/principles.md`.

## Summary
Allow each board to configure which list represents "Done" for completion moves.

## Goal
Support pipelines with different final stages without special-casing list names.

## Scope
- Multiple done lists per board are supported.

## Non-goals
- User-specific completion mappings.

## Definition of Done
- [x] Board data includes a configurable Done list reference.
- [x] UI exposes the Done list configuration.
- [x] Completion behavior respects the configured Done list.
- [x] Safe fallback if the configured list is missing.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep configuration in mock data for now.
- If no done lists are configured on a board, completion should not auto-move.
