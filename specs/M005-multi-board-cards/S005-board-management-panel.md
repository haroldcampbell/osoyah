# S005-Board Management Panel: Navigation + Presentation Controls

Conform to `docs/principles.md`.

## Summary

Add a collapsible left-side panel that surfaces the full board list and lets users manage how boards are presented (sorting, grouping, density, and visibility).

## Goal

Provide a dedicated, contextual surface for navigating and organizing boards without leaving the current board.

## Non-goals

- Backend persistence or multi-user collaboration.
- Board hierarchy or roll-ups (handled in later milestones).
- Bulk edit operations across multiple boards.

## Definition of Done

- [x] Users can open and collapse a left-side board panel from the main board view.
- [x] Panel shows the full board list with board name and a clear current-board highlight.
- [x] Users can switch boards from the panel.
- [x] Users can sort boards by name (A-Z/Z-A) and recent activity.
- [x] Users can manually reorder boards in list view via drag-and-drop; manual reorder updates the stored manual order.
- [x] Applying a sort mode overwrites the manual order index.
- [x] Users can pin/favorite boards to a separate pinned section; pinned boards can be unpinned via the per-board overflow menu.
- [x] Users can archive boards and access an Archived boards view.
- [x] Existing single-board flows continue to work.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Panel trigger lives in the page header, to the left of the main \"Kanban\" label; header should be shorter with a bottom border separating it from the board.
- Remove list/gallery and density toggles; panel uses a compact list view by default.
- If \"recent activity\" is ambiguous in mock data, use last board selection time as the default.
- Manual reordering updates the manual order list; applying any sort mode recalculates and overwrites manual order.
- Archived boards appear in a separate Archived view within the panel.
- Archived boards still appear in card membership lists with an \"Archived\" indicator.
- Pin/Archive actions live in a per-board overflow menu (vertical dots) to reduce clutter.
- Board section headers show counts and are collapsible (default expanded).
- Current board is indicated via background color + font weight (no \"Current\" label).
- Drag handles are hidden until the panel is hovered.
