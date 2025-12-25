# S006-03-Panel Width + Save Notification

Conform to `docs/principles.md`.

## Summary

Make the card detail panel wide enough for large content and add a small floating notification when changes are saved.

## Goal

Improve readability for long descriptions and confirm autosave behavior without disrupting focus.

## Non-goals

-   Markdown rendering or attachments.
-   Reworking the overall board layout.

## Definition of Done

-   [ ] The card detail side panel width is doubled to accommodate larger content.
-   [ ] A small floating notification confirms when card changes have been saved.
-   [ ] Notification displays for title, description, and comment saves.
-   [ ] Notification remains visible for 3–5 seconds and fades out.
-   [ ] Notification appears in the global bottom-right corner.
-   [ ] Notification triggers after the save debounce completes (not on every keystroke).
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.
