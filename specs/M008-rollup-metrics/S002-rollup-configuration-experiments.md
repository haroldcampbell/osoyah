# S002-Roll-Up Configuration (Experiments): Mode Selection

Conform to `docs/principles.md`.

## Summary
Add configuration scaffolding to experiment with alternative roll-up modes.

## Goal
Enable testing of roll-up variants without reshaping core data models.

## Non-goals
- Full UI for end-user configuration.
- Persisted user-level preferences.

## Definition of Done
- [ ] A config entry controls the roll-up mode.
- [ ] Alternate modes can be toggled for experimentation.
- [ ] Default remains relationship-scoped.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Candidate modes: direct-membership, subtree-wide, relationship-scoped (default).
