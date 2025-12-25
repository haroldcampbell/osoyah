# S006-02-Markdown Attachments: Drag-and-Drop Uploads

Conform to `docs/principles.md`.

## Summary

Add drag-and-drop file uploads to description and comment editors that append Markdown links to the content.

## Goal

Let users attach images and documents directly within Markdown for richer card detail.

## Non-goals

-   Markdown rendering decisions (see S006-01).
-   Panel layout or notification changes (see S006-03).

## Definition of Done

-   [ ] Drag-and-drop uploads work in description and comment editors.
-   [ ] Dropped files append Markdown links (image syntax for images, link syntax for others) into the editor content.
-   [ ] Image attachments are inserted at the cursor position; non-image documents append at the end.
-   [ ] Supported file types are accepted (PNG, JPG/JPEG, GIF, WEBP, PDF, CSV, TXT).
-   [ ] Unsupported file types show a clear inline rejection message.
-   [ ] Files larger than 5MB are rejected with a clear error.
-   [ ] Multiple-file drops accept valid files and report per-file errors inline for rejects.
-   [ ] Attachment handling is mocked (no real upload), but Markdown references use URL-style placeholders (no data URLs).
-   [ ] Image filenames use GUID v4 values in the generated URLs.
-   [ ] Placeholder URLs use a consistent pattern (e.g., `https://assets.local/uploads/{guid}.{ext}`).
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   Inline rejection messages should render below each editor, not inside the textarea.
-   Use mocked upload URLs now; real storage is defined in S006-04.
