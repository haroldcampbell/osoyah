# S007-Card Panel List Picker: Move Cards Without Dragging

Conform to `docs/principles.md`.

## Summary
Add a list picker in the card side-panel so cards can be moved between lists without drag-and-drop.

## Goal
Allow list changes directly from the card panel while keeping the current list visible and the UI compact.

## Non-goals

- Changes to list ordering logic.
- New board/list data models beyond existing list metadata.
- Automatic status changes beyond existing done-list behavior.

## Definition of Done

- [ ] Card panel shows the current list name to the left of “Last activity” in the meta row.
- [ ] Clicking the current list opens a CDK menu of available lists on the active board.
- [ ] The current list is visually distinguished in the menu (bold, italic, or similar marker).
- [ ] Selecting a list moves the card to that list and updates panel state.
- [ ] List move uses existing done-list behavior (completion state changes if moving into/out of done lists).
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- If the card is already in the selected list, no move occurs.
