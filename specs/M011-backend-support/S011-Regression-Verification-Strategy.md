# S011-Regression Verification Strategy

Conform to `docs/principles.md`.

## Summary

Define the minimum verification steps required to prevent regressions during backend integration with SQLite persistence, including required test coverage and log locations.

## Goal

Provide a repeatable verification checklist that ties critical state changes to concrete assertions and log outputs for SQLite-backed behavior.

## Non-goals

-   Adding new automated tests in this spec.
-   Running tests in the sandbox.
-   Changing existing test harnesses.

## Definition of Done

-   [ ] Required regression checks are listed for unit, integration, and E2E scopes.
-   [ ] Each check specifies the intended state change it validates (board/list/card/relationship).
-   [ ] Expected log locations are documented (`client/logs/`, `backend/server/logs/`).
-   [ ] A minimum pass criteria is defined for release readiness.

## Acceptance tests (exact commands + expected artifacts/output)

-   N/A (planning-only). Document changes only.
-   If backend changes are introduced:
    -   `python backend/scripts/lint.py` (writes `backend/server/logs/lint.log`)
    -   `python backend/scripts/pytest.py` (writes `backend/server/logs/pytest.log`)
    -   `python backend/scripts/coverage.py` (writes `backend/server/logs/coverage.log`)

## Notes (edge cases, hazards, perf constraints)

-   E2E checks must use stable `data-*` attributes to validate entity-specific changes.
-   If backend tests are not yet in place, document the interim validation steps explicitly.
-   Include at least one backend test that exercises SQLite read/write paths.
