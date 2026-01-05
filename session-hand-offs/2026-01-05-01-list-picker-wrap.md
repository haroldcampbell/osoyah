# 2026-01-05-01-list-picker-wrap

## Summary
- Completed S007 list picker UI/behavior with grid-aligned meta row and list move scrolling.
- Stabilized E2E coverage for list picker move + scroll checks.
- Added S008 spec for card move system comments and captured E2E scroll learning.

## Work Completed
- Implemented card panel list picker, menu styling, and list move scroll handling.
- Implemented list move auto-scroll with delayed follow-up scroll (80ms + 160ms) to keep the moved card visible after list changes.
- Updated E2E list picker tests to avoid role-based CDK menu hangs by targeting `.card-panel-list-option` elements and verifying the trigger text.
- Reworked scroll verification to assert `scrollLeft` increases after moving a card to a rightward list instead of relying on bounding-box visibility.
- Marked S007 DoD complete and updated M006 milestone.
- Added S008 spec draft for list-move system comments.

## Decisions
- Use `scrollLeft` changes for horizontal scroll E2E assertions instead of bounding boxes.

## Open Questions
- Should list moves always generate a system comment, even when done-list status comments already fire? - Yes. Will be implemented in a future spec (S008).

## Next Steps
- Complete S005, S006, then S008
- Confirm S008 scope and desired comment behavior.
- Implement S008 once approved.
