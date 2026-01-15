# S013-API Board Service Refactor

Conform to `docs/principles.md`.

## Summary

Introduce a stateless API wrapper (`APIBoardService`) and refactor `BoardService` to depend on it for all backend calls, keeping UI state local to `BoardService`.

## Goal

Separate backend I/O from UI state so tests can use a deterministic API wrapper and the UI state service becomes a predictable state container.

## Non-goals

-   Changing product behavior or UI interactions.
-   Adding new backend endpoints.
-   Replacing the optimistic update flow defined in S007.

## Definition of Done

-   [ ] Create `client/src/app/api/api.board.requests.ts` containing a stateless API wrapper service.
-   [ ] `BoardService` depends on `APIBoardService` for all backend calls (no direct `HttpClient` usage).
-   [ ] API wrapper includes retry logic for transient failures and error mapping consistent with existing UX patterns.
-   [ ] Unit tests use `APIBoardService` or mocks instead of `HttpClient` directly.
-   [ ] E2E tests use `APIBoardService` (or API wrapper helpers) for setup/teardown data creation.
-   [ ] Client behavior remains unchanged for reads, writes, and optimistic updates.
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run test`
    -   Writes `client/logs/test.log`.
-   `npm run e2e`
    -   Writes `client/logs/e2e.log`.

## Notes (edge cases, hazards, perf constraints)

-   API wrapper should be stateless and must not own UI state.
-   Retry logic must have clear termination and only apply to transient failures (e.g., 0/502/503/504).
-   Error mapping should preserve existing error messaging and toast behavior.

## Open questions

-   Provide the JustAddFlow `APIBoardRequests` example to align retry + error mapping implementation.
