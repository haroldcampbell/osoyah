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
-   Renamed M001 spec files to S-prefixed filenames and updated spec content.
-   Added milestone docs for M002 and M003.

## Decisions

-   Use file-based mock data in `public/assets/data.json` accessed via `HttpClient`.
-   Keep data models limited to Board/List/Card for now.

## Open Questions

## Next Steps

-   Wire the mock service into a basic UI view when ready.
-   Commit changes from M001 implementation.
