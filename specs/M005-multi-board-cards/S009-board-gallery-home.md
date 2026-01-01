# S009-Board Gallery Home: Recent + Pinned + All Boards

Conform to `docs/principles.md`.

## Summary

Introduce a gallery-style boards home at `/boards` (and redirect `/` to it) that surfaces Recent, Pinned, and All Boards sections with a global title filter and reversible sorting for All Boards.

## Goal

Give users a fast, visual entry point to find and open boards without entering a specific board first.

## Non-goals

-   Backend persistence or multi-user collaboration.
-   Tags and tag-based filtering.
-   Board activity indicators or alert bubbles.
-   Board hierarchy or roll-ups (handled in later milestones).

## Definition of Done

-   [x] Navigating to `/` redirects to `/boards`.
-   [x] `/boards` shows a gallery view with sections in this order: Recent, Pinned, All Boards.
-   [x] Recent boards are derived from a per-user last-opened timestamp tracked locally (no changes to shared mock data).
-   [x] Pinned boards use the existing pinned flag (no separate starred concept).
-   [x] All Boards supports reversible sorting for name (A-Z/Z-A), last opened (newest/oldest), and created date (newest/oldest).
-   [x] The selected All Boards sort mode persists locally.
-   [x] Boards include a `createdAt` timestamp in the data model and mock data.
-   [x] A single global search/filter input filters boards by title across all three sections.
-   [x] Opening a board from the gallery navigates to `/boards/<board-id>`.
-   [x] Archived boards do not appear in gallery sections.
-   [x] Empty states are shown when a section has no results (including filtered results).
-   [x] Board settings displays the board created date.
-   [x] Board settings supports an optional short description (max 30 characters).
-   [x] Board settings header has a bottom border with the same full-bleed treatment as the warning footer.
-   [x] Existing single-board flows continue to work.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run format:check` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   Store last-opened timestamps and sort preference in local storage keyed by board ID.
-   Use the existing board selection flow to update the last-opened timestamp.
-   If a board has never been opened, it should not appear in Recent.
-   Keep the gallery layout responsive with board cards arranged in a grid.
-   Model local persistence state (last opened + sort preference) for future backend storage.
