# S005-Board Management Panel: Navigation + Presentation Controls

Conform to `docs/principles.md`.

## Summary

Add a collapsible right-side panel that surfaces the full board list and lets users manage how boards are presented (view mode, sorting, grouping, density, and visibility).

## Goal

Provide a dedicated, contextual surface for navigating and organizing boards without leaving the current board.

## Non-goals

- Backend persistence or multi-user collaboration.
- Board hierarchy or roll-ups (handled in later milestones).
- Bulk edit operations across multiple boards.

## Definition of Done

- [ ] Users can open and collapse a right-side board panel from the main board view.
- [ ] Panel shows the full board list with board name and membership indicators.
- [ ] Users can switch boards from the panel.
- [ ] Users can create, rename, and delete boards from the panel using the same validation and confirm dialog rules as S004.
- [ ] Users can toggle board list presentation between list view and card/gallery view.
- [ ] Users can change board list density (comfortable/compact).
- [ ] Users can sort boards by at least name (A-Z) and recent activity.
- [ ] Users can manually reorder boards in list view via drag-and-drop and optionally switch to a predefined sort mode.
- [ ] Users can pin/favorite boards to keep them at the top of the list.
- [ ] Users can hide/archive boards from the main list and optionally show hidden boards.
- [ ] Existing single-board flows continue to work.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Keep panel behavior predictable across viewports; define a default collapsed/expanded state for small screens.
- If "recent activity" is ambiguous in mock data, use last board selection time as the default.
- Confirm that "sortable list view" means drag-and-drop reordering; adjust if the spec intent is different.
