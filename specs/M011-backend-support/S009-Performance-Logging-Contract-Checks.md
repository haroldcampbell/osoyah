# S009-Performance + Logging + Contract Checks

Conform to `docs/principles.md`.

## Summary

Add baseline performance expectations, logging conventions, and contract checks for backend integration with SQLite persistence.

## Goal

Ensure backend responses are observable, consistent, and do not regress performance or data shape expectations for SQLite-backed reads.

## Non-goals

-   Building full observability infrastructure.
-   Large-scale performance optimization.

## Definition of Done

-   [ ] Performance budgets are documented for key endpoints (boards, snapshot).
-   [ ] Logging conventions are defined for server and client (including error cases).
-   [ ] Contract checks validate response shape and ordering rules.
-   [ ] Locations for logs and artifacts are documented.
-   [ ] Contract checks validate `guid` presence, UUID4 format, and uniqueness.
-   [ ] SQLite query timings are captured for key endpoints (boards, snapshot).
-   [ ] Acceptance tests passed

## Acceptance tests (exact commands + expected artifacts/output)

-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.
-   Define any required frontend checks; store logs under `client/logs/`.

## Notes (edge cases, hazards, perf constraints)

-   Keep checks lightweight to avoid slowing local iteration.
-   Ensure `guid` checks do not require full table scans in production paths.
-   Prefer indexed SQLite queries when defining performance budgets.
