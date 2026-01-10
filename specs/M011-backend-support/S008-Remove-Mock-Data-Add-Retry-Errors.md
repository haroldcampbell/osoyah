# S008-Remove Mock Data + Retry/Error States

Conform to `docs/principles.md`.

## Summary

Remove the mock data path and harden error and retry handling for backend-backed data loading from SQLite persistence.

## Goal

Ensure the app is fully backed by the API with resilient error handling that matches UX patterns and is powered by SQLite.

## Non-goals

-   Changing feature behavior beyond data loading and error handling.
-   Adding auth/permissions.

## Definition of Done

-   [ ] Mock data loading path is removed or gated behind a dev-only flag.
-   [ ] Retry behavior is defined for transient failures.
-   [ ] Error messaging uses existing UX patterns for loading and failures.
-   [ ] Board/gallery loading states remain visible and predictable.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact frontend test command(s); store logs under `client/logs/`.
-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.
-   Define exact backend test command(s); store logs under `backend/server/logs/`.

## Notes (edge cases, hazards, perf constraints)

-   Avoid infinite retry loops; define clear termination conditions.
-   Surface clear errors for SQLite connectivity failures (e.g., missing DB file).
