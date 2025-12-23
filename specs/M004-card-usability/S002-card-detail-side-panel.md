# S002-Card Detail Side Panel: Open + Edit Card Details

Conform to `principles.md`.

## Summary
Add a side panel that opens when a card is clicked, showing and editing card details (title, description, comments/posts, created-at, updated-at).

## Goal
Enable deeper card editing without leaving the board, similar to Trello/Asana detail views.

## Non-goals
- Modal dialogs that replace the board.
- Persistence or backend syncing.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- The panel should be dismissible via close button and `Escape`.
- Keep board interactions functional when the panel is open (e.g., scrolling).
- Prefer a single panel instance managed by the board container.
- Order of content in the panel must be fixed and explicit in the template:
  1) Title (editable)
  2) Description (editable)
  3) Metadata row (created/updated)
  4) Comments list (chronological)
  5) Add comment form
