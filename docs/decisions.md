# Decisions

Current active decisions, consolidated from session hand-offs. When a decision changes, replace it here with the new choice.

## Architecture

-   Backend: FastAPI (`server/`).
-   Frontend: Angular (`client/`).

## Frontend data strategy

-   Use file-based mock data in `client/public/assets/data.json` accessed via `HttpClient`.
-   Keep data models limited to Board/List/Card for now.

## Specs and documentation

-   Specs are named with `S00X-` prefixes and live alongside each milestone’s `milestone.md`.
-   Milestone docs live at `specs/M00X-*/milestone.md`.
-   Templates use `_template_<purpose>.md` naming.
-   Track progress via session hand-off entries in `session-hand-offs/`.
-   Session hand-offs use `yyyy-mm-dd-nn-title.md` filenames for same-day ordering.
