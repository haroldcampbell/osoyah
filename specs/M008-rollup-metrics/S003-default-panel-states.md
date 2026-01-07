# S003-Default Panel States: Hierarchy + Roll-Ups

Conform to `docs/principles.md`.

## Summary
Adjust default UI states so the hierarchy panel starts closed and roll-up metrics default to Direct scope.

## Goal
Reduce initial UI noise while keeping roll-up metrics focused on the current board by default.

## Non-goals
- Changing roll-up metric definitions or display formatting.
- Altering hierarchy data, relationships, or edit behavior.

## Definition of Done
- [ ] Hierarchy panel is closed by default on board load.
- [ ] Roll-up metrics default scope is Direct.
- [ ] Existing toggle controls still allow switching hierarchy open/closed and roll-up scope.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep behavior changes limited to default state only.
