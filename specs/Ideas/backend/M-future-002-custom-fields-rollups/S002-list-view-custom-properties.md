# S002-List View Custom Properties: Capture + Display

Conform to `docs/principles.md`.

## Summary
Expose custom card properties in list view with spreadsheet-like editing for quick updates.

## Goal
Allow users to view and edit custom card property values directly in the list view.

## Non-goals

- Inline editing of core card fields beyond what already exists.
- Advanced formula or computed fields.
- Bulk edit across multiple cards.

## Definition of Done

- [ ] List view displays custom property columns after the standard columns.
- [ ] Users can edit custom property values inline in list view.
- [ ] List view supports empty states when no custom properties exist.
- [ ] List view shows validation feedback for invalid custom values (e.g., number/date parsing).
- [ ] Changes update the card's in-memory custom property values immediately.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- For select fields, list view should render a dropdown with defined choices.
- For date fields, prefer a simple text input with validation before introducing a date picker.
