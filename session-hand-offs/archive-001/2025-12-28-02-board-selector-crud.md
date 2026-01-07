# 2025-12-28-02-board-selector-crud

## Summary
- Completed S004 board selector + CRUD with search, settings-based rename/delete, and reduced visual clutter.
- Added additional mock boards for scale testing and drafted S006/S007 specs.
- Milestone context: M005-Multi-Board Cards.

## Work Completed
- Implemented board selector dropdown near title with search, create flow, and compact styling.
- Added board settings surface for rename/delete with confirm dialog.
- Seeded new boards with a default "Tasks" list.
- Added Playwright coverage for S004 and updated specs/milestone status.

## Decisions
- Board selector dropdown excludes rename/delete; those actions live in board settings.
- Long board names are truncated with tooltips (no hard max yet; new spec drafted).

## Open Questions
- None.

## Outstanding (M005)
- S005 board management panel (Spec: `specs/M005-multi-board-cards/S005-board-management-panel.md`).
- S006 board routing + deep links (Spec: `specs/M005-multi-board-cards/S006-board-routing-deep-links.md`).
- S007 title length validation (Spec: `specs/M005-multi-board-cards/S007-title-length-validation.md`).

## Next Steps
- Start S005 spec review when ready.
