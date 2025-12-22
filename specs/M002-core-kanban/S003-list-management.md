# S003-List Management: Create, rename, remove

Conform to `principles.md`.

## Summary

Provide basic list CRUD operations so users can shape the board structure.

## Goal

Allow users to create, rename, and remove lists within a board.

## Non-goals

- Persisting list changes to a backend.
- Advanced list settings (limits, WIP, colors).

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` succeeds with no lint errors.
- `npm run start` launches the app and:
  - users can add a new list with a title.
  - users can rename an existing list.
  - users can remove a list and its cards are removed from the UI.
- `npm run test` passes with unit tests covering list add, rename, and remove flows.

## Notes (edge cases, hazards, perf constraints)

- Prevent empty list titles by requiring a non-empty value.
- Confirm destructive actions if the UI makes it easy to misclick.
