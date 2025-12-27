# Decisions

Current active decisions, consolidated from session hand-offs. When a decision changes, replace it here with the new choice.

## Architecture

-   Backend: FastAPI (`server/`).
-   Frontend: Angular (`client/`).

## Frontend data strategy

-   Use file-based mock data in `client/public/assets/data.json` accessed via `HttpClient`.
-   Keep data models limited to Board/List/Card for now.
-   Use Playwright for E2E tests.
-   Use Angular CDK drag-and-drop for list/card ordering.
-   Maintain board state in-memory on the client until backend persistence is added.
-   Styles for markdown injected via `innerHTML` must live in global styles (component-scoped styles do not apply).
-   Markdown rendering uses `marked` + `DOMPurify`.

## Testing

-   For Angular CDK drag-and-drop, prefer mouse-driven drag with small pauses over Playwright's `dragAndDrop`/`dragTo`.
-   E2E assertions should prefer stable identifiers (e.g., `data-card-id`) over list counts or transient text.
-   E2E test files should include spec tags in test titles and a short `// Spec: S00X` header comment for traceability.

## Specs and documentation

-   Specs are named with `S00X-` prefixes and live alongside each milestone’s `milestone.md`.
-   Milestone docs live at `specs/M00X-*/milestone.md`.
-   Future/idea milestones live under `specs/Ideas/` to reduce noise in active milestone lists.
-   Templates use `_template_<purpose>.md` naming.
-   Milestone spec lists use `[ ]`/`[x]` checkboxes to track execution status.
-   Specs should include a `Definition of Done` section; add one before implementation if missing.
-   Specs should avoid mixing concerns; if scope grows beyond a single cohesive behavior, split into a new spec.
-   Track progress via session hand-off entries in `session-hand-offs/`.
-   Session hand-offs use `yyyy-mm-dd-nn-title.md` filenames for same-day ordering. DO NOT include milestone ID (e.g. m00x) as a part of the session hand-off filename or title.
-   Prefer free SVG icons from established libraries (Font Awesome) instead of hand-drawn SVG paths.

## Domain-driven design boundaries

-   Use domain-driven design boundaries and keep specs scoped to a single bounded context when possible.
-   Current bounded contexts:
    -   Board Management: lists, cards, ordering, selection.
    -   Card Content: descriptions, comments, markdown rendering, attachments.
    -   UI Shell: panel layout, notifications, layout chrome.
-   If a spec spans multiple contexts, split it or explicitly justify the cross-context scope in the spec notes.
