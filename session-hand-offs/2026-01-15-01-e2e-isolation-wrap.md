# 2026-01-15-01-e2e-isolation-wrap

## Summary
- Refactored E2E setup to use API helpers and isolate test data per spec, removing api-fixtures usage.
- Fixed rollup default behavior and ensured rollups render without hierarchy constraints.
- Milestone context: M011 S008 in progress; E2E flakiness under parallel runs noted for S013.

## Work Completed
- Added API helpers for board relationships and expanded API-based setup/teardown across remaining E2E specs.
- Added board-list prefetch on card panel open and list loading for attach flows to prevent empty dropdowns.
- Updated backend to default rollups disabled on board creation; rollups render when enabled.
- Hardened E2E specs with isolated data and unique titles to reduce shared-state collisions.

## Decisions
- Document E2E flakiness under parallel runs in S008 and defer further stabilization to S013.

## Open Questions
- Whether to keep parallel workers at default or explicitly cap in `npm run e2e`.
- Whether to introduce a shared API request context for teardown to avoid timeout-related cleanup failures.

## Outstanding (M011)
- S008 acceptance tests still require confirmation with `npm run e2e` under parallel workers.
- S013 API/BoardService refactor for state separation (Spec: `specs/M011-backend-support/S013-Api-Board-Service-Refactor.md`).

## Next Steps
- Re-run `npm run e2e` with default workers and collect `client/logs/e2e.log`.
- Start S013 work to split UI services from API services and reduce state mutation.
