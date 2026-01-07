# 2025-12-21-02-frontend-setup

## Summary

-   Implemented M001 front-end environment setup in `client/`.
-   Added linting/formatting, Angular Material baseline, and file-based mock API.
-   Updated M001 specs to reflect actual setup choices and acceptance tests.

## Work Completed

-   Generated Angular workspace in `client/` and installed dependencies.
-   Added ESLint via angular-eslint and Prettier config + scripts.
-   Configured Angular Material theme and animations.
-   Added Board/List/Card models and a `BoardService` reading `public/assets/data.json`.
-   Renamed spec files to use S-prefixed names (e.g., `S001-*.md`) and updated spec content.
-   Standardized milestone docs inside each milestone folder as `milestone.md`.
-   Renamed templates to `specs/_template_milestone.md` and `specs/_template_spec.md`.
-   Updated session hand-off naming to `yyyy-mm-dd-nn-title.md` for same-day ordering.
-   Added milestone docs for M002 and M003.

## Decisions

-   Use file-based mock data in `public/assets/data.json` accessed via `HttpClient`.
-   Keep data models limited to Board/List/Card for now.
-   Specs are named with `S00X-` prefix and live alongside each milestone’s `milestone.md`.
-   Templates follow `_template_<purpose>.md` naming.
-   Session hand-offs are ordered by `yyyy-mm-dd-nn-title.md` filenames.

## Open Questions

## Next Steps

-   Wire the mock service into a basic UI view when ready.
-   Commit changes from M001 implementation.
