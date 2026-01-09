# S001-Custom Card Properties: Define Card Fields

Conform to `docs/principles.md`.

## Summary
Introduce board-level custom card properties so cards can carry structured fields beyond title/description.

## Goal
Let users define and manage a simple set of custom fields that apply to every card on a board.

## Non-goals

- Field-level permissions or per-card field visibility rules.
- Cross-board property schemas.
- Backend persistence or multi-user synchronization.

## Definition of Done

- [ ] Board settings include a section to add, rename, and remove custom card properties.
- [ ] Supported field types include `text`, `number`, `date`, and `select` (single choice).
- [ ] Each custom property has a stable id, label, type, and optional default value.
- [ ] Custom property definitions are stored per board in mock data for the session.
- [ ] Cards initialize missing custom property values from defaults when the schema changes.
- [ ] Validation prevents duplicate property names on a board.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Removing a property should remove stored values for that property on cards in-memory only.
- If a property label changes, preserve the existing values under the same property id.
