# S003-Inline Title Editing: Lists + Cards

Conform to `docs/principles.md`.

## Summary
Allow list titles and card titles to be edited inline with quick commit/cancel behavior.

## Goal
Make it easy to rename lists and cards without opening additional dialogs.

## Non-goals
- Bulk rename tools or keyboard-only workflows.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.

## Definition of Done
- Clicking list/card titles enters inline edit with focused input and selected text.
- Inline edit saves on Enter, cancels on Escape, and exits on blur.
- Only one card can be in inline edit mode at a time.
- Inline editing keeps card description visible and does not shift layout.

## Notes (edge cases, hazards, perf constraints)
- Card preview mode should not show Edit/Delete buttons; clicking the title begins inline title edit.
- For lists, inline edit should not require a visible Save button; use Enter to save, Escape to cancel.
- Commit on Enter; cancel on Escape; blur should exit inline edit.
- Escape should cancel inline edits even if the input is not focused.
- Starting inline edit should focus the input and select the existing text.
- Only one card can be in inline edit mode at a time; starting a new inline edit cancels any prior one.
- Inline title editing should keep the card description visible.
- The inline title edit input should stretch to full card width and use a subtle 2px radius.
- Card title text should align with description; input padding should not shift the title.
- Avoid layout shifts when toggling between title view and inline edit.
- Empty titles should fall back to a user-friendly placeholder instead of erroring.
- Ensure dragging is not triggered when editing.
