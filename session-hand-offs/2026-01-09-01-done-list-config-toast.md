# 2026-01-09-01-done-list-config-toast

## Summary
- Implemented configurable done-list settings with service helpers and board settings UI.
- Updated board settings behavior to close on save and show self-dismissing toast feedback.
- Added UX patterns documentation and integrated it into workflow references.
- Milestone context: M009 S001 complete, tests passed.

## Work Completed
- Added done-list query/update helpers in board service and wired completion moves through them.
- Exposed Done list toggles in board settings with new styling.
- Added toast feedback for board settings save (success + failure) and removed inline status message.
- Updated E2E specs to handle board settings auto-close after save.
- Removed obsolete M009 S001 spec, renumbered remaining M009 specs, updated mockup reference.
- Added `docs/ux-patterns.md` and referenced it from README/process/agents/docs overview.

## Decisions
- State changes should surface visual feedback via self-dismissing toasts for success and failure.

## Open Questions
- None.

## Outstanding (M009)
- S002 Board View Modes (List) pending. (Spec: `specs/M009-views-and-state/S002-board-view-modes-list.md`)

## Next Steps
- Review and start S002 spec when ready.
