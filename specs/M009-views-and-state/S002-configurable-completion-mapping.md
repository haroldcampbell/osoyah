# S002-Configurable Completion Mapping: Done List

Conform to `docs/principles.md`.

## Summary
Allow each board to configure which list represents "Done" for completion moves.

## Goal
Support pipelines with different final stages without special-casing list names.

## Non-goals
- Multiple Done lists per board.
- User-specific completion mappings.

## Definition of Done
- [ ] Board data includes a configurable Done list reference.
- [ ] UI exposes the Done list configuration.
- [ ] Completion behavior respects the configured Done list.
- [ ] Safe fallback if the configured list is missing.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep configuration in mock data for now.
