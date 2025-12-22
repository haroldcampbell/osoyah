# S005-Testing: Unit + E2E coverage

Conform to `principles.md`.

## Summary

Establish unit and end-to-end tests that protect the core Kanban flows from regressions.

## Goal

Provide baseline automated coverage for board rendering, list/card CRUD, and drag-and-drop behavior.

## Non-goals

- Full cross-browser matrix.
- Visual regression tooling.
- Performance benchmarking.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run test` passes with unit tests covering board render, list/card CRUD, and drag-and-drop ordering.
- `npm run e2e` passes with E2E tests covering:
  - render board with lists/cards from mock data.
  - add, edit, and remove a card.
  - add, rename, and remove a list.
  - drag cards within and between lists.
  - drag lists to reorder.

## Notes (edge cases, hazards, perf constraints)

- Use Playwright for E2E coverage and document setup in `client/README.md`.
- Keep E2E data deterministic using the mock data source.
