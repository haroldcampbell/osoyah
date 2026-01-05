# S006-Card Panel Component: Extract Side Panel

Conform to `docs/principles.md`.

## Summary
Refactor the card side-panel into a dedicated component for clearer separation of concerns and easier iteration.

## Goal
Make the card panel a standalone component with a focused template, styles, and inputs/outputs.

## Non-goals

- Visual redesign of the card panel.
- Behavioral changes to card editing, relationships, or comments.
- New data models.

## Definition of Done

- [ ] Card side-panel is extracted into its own component.
- [ ] The board view hosts the new card panel component with the same behavior and UI.
- [ ] Existing panel tests remain passing or are moved to the new component.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Keep bindings stable to avoid regressions in selection + routing.
