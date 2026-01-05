# S008-Card Move System Comments: List Change Activity

Conform to `docs/principles.md`.

## Summary

Add system comments when a card moves between lists so the card’s activity log reflects list changes.

## Goal

Make list moves visible in the card’s comment stream, whether moved by drag-and-drop or the list picker.

## Non-goals

-   Persisting activity to a backend.
-   New activity feeds or global board history.
-   Changing existing relationship comment templates.

## Definition of Done

-   [x] Moving a card between lists generates a system comment on the card.
-   [x] The system comment includes the destination list title (e.g., "Card moved to Done.").
-   [x] Drag-and-drop moves generate the same comment as list picker moves.
-   [x] Existing done-list status comments remain unchanged and may coexist with the move comment.
-   [x] Include the board information in the comment.
-   [x] Ensure that the board Name is clickable and will navigate to the board, opening the card's side panel details.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   No comment is added when the card is moved to its current list.
