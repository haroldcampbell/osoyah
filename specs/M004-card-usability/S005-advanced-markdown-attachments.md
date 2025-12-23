# S005-Advanced Markdown Attachments: Richer Content

Conform to `principles.md`.

## Summary
Extend Markdown support to include advanced cases like image attachments, including drag-and-drop uploads similar to GitHub Projects.

## Goal
Allow richer card descriptions and comments for teams that need visual context.

## Non-goals
- Multi-user collaboration or permissions.
- External storage integrations beyond the local app.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Support drag-and-drop uploads into description and comment editors.
- Allow a safe subset of file types to start:
  - Images: PNG, JPG/JPEG, GIF, WEBP.
  - Documents: PDF, CSV, TXT.
- Store attachments in-memory and reference them in Markdown (e.g., `![alt](data:...)` or `[file.pdf](data:...)`).
- Reject unsupported types with a clear inline message.
- Enforce a 5MB per-file size cap with a clear error if exceeded.
- Provide a safe Markdown rendering path (no raw HTML).
- Ensure large images are constrained in display size to keep cards readable.
