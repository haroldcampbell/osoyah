# S006-01-Markdown Rendering + Safety: Consistent Content

Conform to `docs/principles.md`.

## Summary

Standardize Markdown rendering for card descriptions and comments using a well-established library with safe output.

## Goal

Ensure Markdown renders consistently on cards and in the side panel without exposing unsafe HTML.

## Non-goals

-   Drag-and-drop attachment uploads (see S006-02).
-   Panel layout or notification changes (see S006-03).

## Definition of Done

-   [ ] Markdown rendering uses a well-established library (no custom parser).
-   [ ] Markdown rendering is safe (no raw HTML, malicious content blocked).
-   [ ] Supported Markdown elements include headings (H1–H3), unordered/ordered lists, links, bold/italic, inline code, fenced code blocks, blockquotes, and images.
-   [ ] Single-asterisk emphasis (`*text*`) renders as bold to match Slack/WhatsApp behavior.
-   [ ] Card descriptions in the board list render Markdown (not raw text).
-   [ ] In the side panel, the description renders processed Markdown when not editing; when editing, show raw Markdown text.
-   [ ] Comment bodies render Markdown using the same renderer.
-   [ ] Code blocks and blockquotes render in both the side panel and card previews.
-   [ ] Card previews remain clamped/truncated even when rendering code blocks or blockquotes.
-   [ ] Large images are constrained in display size.
-   [ ] Add a mock card that exercises core Markdown elements for quick visual verification.
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.
