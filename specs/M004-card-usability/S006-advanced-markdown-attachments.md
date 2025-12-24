# S006-Advanced Markdown Attachments: Richer Content

Conform to `principles.md`.

## Summary
Extend Markdown support to include advanced cases like image attachments, including drag-and-drop uploads similar to GitHub Projects.

## Goal
Allow richer card descriptions and comments for teams that need visual context.

## Non-goals
- Multi-user collaboration or permissions.
- External storage integrations beyond the local app.

## Definition of Done
- [ ] Drag-and-drop uploads work in description and comment editors.
- [ ] Supported file types are accepted (PNG, JPG/JPEG, GIF, WEBP, PDF, CSV, TXT).
- [ ] Unsupported file types show a clear inline rejection message.
- [ ] Files larger than 5MB are rejected with a clear error.
- [ ] Attachments are stored in memory and referenced in Markdown via data URLs.
- [ ] Markdown rendering is safe (no raw HTML).
- [ ] Large images are constrained in display size.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.
