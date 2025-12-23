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

## Testing

-   For Angular CDK drag-and-drop, prefer mouse-driven drag with small pauses over Playwright's `dragAndDrop`/`dragTo`.
-   E2E assertions should prefer stable identifiers (e.g., `data-card-id`) over list counts or transient text.

## Specs and documentation

-   Specs are named with `S00X-` prefixes and live alongside each milestone’s `milestone.md`.
-   Milestone docs live at `specs/M00X-*/milestone.md`.
-   Templates use `_template_<purpose>.md` naming.
-   Track progress via session hand-off entries in `session-hand-offs/`.
-   Session hand-offs use `yyyy-mm-dd-nn-title.md` filenames for same-day ordering.
