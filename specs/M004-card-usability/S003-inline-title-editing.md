# S003-Inline Title Editing: Lists + Cards

Conform to `principles.md`.

## Summary
Allow list titles and card titles to be edited inline with quick commit/cancel behavior.

## Goal
Make it easy to rename lists and cards without opening additional dialogs.

## Non-goals
- Bulk rename tools or keyboard-only workflows.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)
- Commit on blur or Enter; cancel on Escape.
- Empty titles should fall back to a user-friendly placeholder instead of erroring.
- Ensure dragging is not triggered when editing.
