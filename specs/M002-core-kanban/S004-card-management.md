# S004-Card Management: Create, edit, remove

Conform to `docs/principles.md`.

## Summary

Provide basic card CRUD operations and inline editing of card details.

## Goal

Enable users to add, edit, and remove cards within lists, including title and description.

## Non-goals

- Due dates, labels, or attachments.
- Rich text editing.
- Backend persistence.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` succeeds with no lint errors.
- `npm run start` launches the app and:
  - users can add a new card to a list with a title.
  - users can edit a card title and description.
  - users can remove a card and it no longer appears in the list.
- `npm run test` passes with unit tests covering card add, edit, and remove flows.

## Notes (edge cases, hazards, perf constraints)

- Require a non-empty title for new or edited cards.
- Keep edit interactions simple (inline or lightweight dialog).
