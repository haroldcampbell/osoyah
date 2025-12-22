# 2025-12-21-03-basic-kanban

## Summary

- Implemented M002 core Kanban UI with list/card CRUD and drag-and-drop.
- Added unit tests and Playwright E2E scaffolding + specs.
- Updated docs and config to support testing and decisions.

## Work Completed

- Replaced the Angular starter view with a minimal Kanban board UI (`client/src/app/board/`).
- Wired board data from `BoardService` with in-memory state for CRUD and ordering.
- Implemented list create/rename/remove and card create/edit/remove flows.
- Added Angular CDK drag-and-drop for list and card ordering.
- Added unit tests for board rendering, CRUD, and drag/drop.
- Added Playwright config, E2E specs, and `npm run e2e` script.
- Added Karma config to bind to `127.0.0.1:9877` to allow tests in sandboxed envs.
- Updated docs: `docs/decisions.md` and `client/README.md`.

## Decisions

- Use Angular CDK drag-and-drop for list/card ordering.
- Maintain board state in-memory on the client until backend persistence is added.
- Use Playwright for E2E tests.

## Open Questions

- None captured.

## Outstanding (M002)

- Run `npx playwright install` in `client/`, then `npm run e2e`. (Spec: `specs/M002-core-kanban/S005-testing.md`)
- Run `npm run lint`. (Specs: `specs/M002-core-kanban/S001-board-flow.md`, `specs/M002-core-kanban/S002-drag-drop.md`, `specs/M002-core-kanban/S003-list-management.md`, `specs/M002-core-kanban/S004-card-management.md`)

## Next Steps

- Complete the outstanding M002 tasks above.

## Test Results

- `npm run test -- --watch=false --browsers=ChromeHeadless` (pass, 7/7).
- `npm run e2e` not run (requires Playwright browser install).
