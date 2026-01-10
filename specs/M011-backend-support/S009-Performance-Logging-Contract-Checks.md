# S009-Performance + Logging + Contract Checks

Conform to `docs/principles.md`.

## Summary

Add baseline performance expectations, logging conventions, and contract checks for backend integration.

## Goal

Ensure backend responses are observable, consistent, and do not regress performance or data shape expectations.

## Non-goals

-   Building full observability infrastructure.
-   Large-scale performance optimization.

## Definition of Done

-   [ ] Performance budgets are documented for key endpoints (boards, snapshot).
-   [ ] Logging conventions are defined for server and client (including error cases).
-   [ ] Contract checks validate response shape and ordering rules.
-   [ ] Locations for logs and artifacts are documented.
-   [ ] Contract checks validate `guid` presence, UUID4 format, and uniqueness.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact backend test command(s); store logs under `server/logs/`.
-   Define any required frontend checks; store logs under `client/logs/`.

## Notes (edge cases, hazards, perf constraints)

-   Keep checks lightweight to avoid slowing local iteration.
-   Ensure `guid` checks do not require full table scans in production paths.
