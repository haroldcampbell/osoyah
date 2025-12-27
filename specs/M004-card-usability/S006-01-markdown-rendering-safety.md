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

-   [x] Markdown rendering uses a well-established library (no custom parser).
-   [x] Markdown rendering is safe (no raw HTML, malicious content blocked).
-   [x] Supported Markdown elements include headings (H1–H4), unordered/ordered lists, links, bold/italic, inline code, fenced code blocks, blockquotes, and images.
-   [x] Single-asterisk emphasis (`*text*`) renders as bold to match Slack/WhatsApp behavior.
-   [x] Card list view does not render full descriptions; it shows a "Details" indicator when a description exists.
-   [x] Details indicator uses a Font Awesome free SVG icon instead of label text.
-   [x] Card metadata row orders details indicator, comment count, then last updated time.
-   [x] In the side panel, the description renders processed Markdown when not editing; when editing, show raw Markdown text.
-   [x] Side panel width is fixed at 800px; layout padding/alignment changes are part of this spec.
-   [x] Side panel title input does not render a "Title" label and uses an accessible label instead.
-   [x] Side panel title/description inputs avoid visible borders unless focused to reduce visual clutter.
-   [x] Description editor height aligns with the rendered description height (clamped to a reasonable maximum).
-   [x] Comment bodies render Markdown using the same renderer.
-   [x] Large images are constrained in display size.
-   [x] Base font family is Roboto, "Open Sans", "PT Serif Caption", "Helvetica Neue", sans-serif; base font size is 12px.
-   [x] Add a mock card that exercises core Markdown elements for quick visual verification.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   This spec intentionally deviates from S005 card density preview behavior by removing description previews from cards.
