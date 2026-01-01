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
-   Markdown rendering uses `marked` + `DOMPurify`.
-   Editable inputs inside panels can use negative horizontal margins to align with panel edges; prefer symmetric offsets (e.g., `margin: 0 -0.5rem`) for clarity.

## Specs and documentation

-   Specs are named with `S00X-` prefixes and live alongside each milestone’s `milestone.md`.
-   Milestone docs live at `specs/M00X-*/milestone.md`.
-   Future/idea milestones live under `specs/Ideas/` to reduce noise in active milestone lists.
-   Templates use `_template_<purpose>.md` naming.
-   Specs should include a `Definition of Done` section; add one before implementation if missing.
-   Specs should avoid mixing concerns; if scope grows beyond a single cohesive behavior, split into a new spec.
-   Prefer free SVG icons from established libraries (Font Awesome) instead of hand-drawn SVG paths.
-   Commit messages include milestone + spec code as `(<milestone>-<spec>)` (e.g., `feat (M004-S006-02): drag placeholder cues`).

## Domain-driven design boundaries

-   Use domain-driven design boundaries and keep specs scoped to a single bounded context when possible.
-   Current bounded contexts:
    -   Board Management: lists, cards, ordering, selection.
    -   Card Content: descriptions, comments, markdown rendering, attachments.
    -   UI Shell: panel layout, notifications, layout chrome.
-   If a spec spans multiple contexts, split it or explicitly justify the cross-context scope in the spec notes.
