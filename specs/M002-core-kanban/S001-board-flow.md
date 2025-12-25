# S001-Board Flow: Basic board view

Conform to `docs/principles.md`.

## Summary

Implement the initial board view that renders lists and cards from mock data with basic UI states.

## Goal

Provide a readable, functional board layout that shows lists and cards and handles empty/loading states.

## Non-goals

- Drag-and-drop interactions.
- Card/list CRUD actions.
- Backend integration beyond `assets/data.json`.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` succeeds with no lint errors.
- `npm run start` launches the app and the board renders lists and cards from `assets/data.json`.
- Removing all lists from `assets/data.json` shows an empty-state message for the board.
- `npm run test` passes with unit tests covering board rendering and empty-state behavior.

## Notes (edge cases, hazards, perf constraints)

- Keep list and card rendering deterministic; no random ordering.
- Use the existing BoardService as the data source.
