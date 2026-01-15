# S008-Remove Mock Data + Retry/Error States

Conform to `docs/principles.md`.

## Summary

Remove the mock data path and harden error and retry handling for backend-backed data loading from SQLite persistence via the API endpoints.

## Goal

Ensure the app is fully backed by the API with resilient error handling that matches UX patterns and is powered by SQLite.

## Non-goals

-   Changing feature behavior beyond data loading and error handling.
-   Adding auth/permissions.

## Definition of Done

-   [x] Mock data loading path is removed; client loads from backend API endpoints.
-   [x] Retry behavior is defined for transient failures.
-   [x] Error messaging uses existing UX patterns for loading and failures.
-   [x] Board/gallery loading states remain visible and predictable.
-   [ ] Acceptance tests passed

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run test`
    -   Writes `client/logs/test.log`.
-   `npm run e2e`
    -   Writes `client/logs/e2e.log`.
-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.

## Notes (edge cases, hazards, perf constraints)

-   Avoid infinite retry loops; define clear termination conditions.
-   Surface clear errors for SQLite connectivity failures (e.g., missing DB file).
-   E2E suite remains flaky under parallel runs; we will not fix further in this spec and will address in S013.
