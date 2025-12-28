# S004-Board Selection + CRUD: Multi-Board Management

Conform to `docs/principles.md`.

## Summary

Add board selection plus basic create/rename/delete flows so users can manage multiple boards in the UI.

## Goal

Let users switch between boards and maintain simple board management without backend persistence.

## Non-goals

-   Backend persistence or multi-user collaboration.
-   Board hierarchy or roll-ups (handled in later milestones).
-   Bulk board operations.

## Definition of Done

-   [x] Users can switch the active board from a visible selector near the board title.
-   [x] Board selector dropdown includes a search box to filter boards by name.
-   [x] Users can create a new board with a name (min 3 chars, not blank, not all numbers).
-   [x] Users can rename an existing board with the same validation rules.
-   [x] Users can delete a board with a confirm dialog safeguard.
-   [x] Board deletion removes memberships on that board without deleting global card data.
-   [x] Existing single-board flows continue to work.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run format:check` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   Decide where the board selector lives and keep the UI predictable across viewports.
-   Add E2E coverage for switching boards and verifying shared card membership once the selector exists.
-   Board selector uses a dropdown control.
-   Search filters the dropdown list as the user types and shows an empty state when no matches exist.
-   Board rename/delete actions live in a board settings surface (not the selector dropdown).
