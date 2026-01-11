# S007-Client Optimistic Updates + Reconciliation

Conform to `docs/principles.md`.

## Summary

Introduce client-side optimistic updates for backend writes with reconciliation on server responses from SQLite-backed persistence.

## Goal

Maintain fast UI feedback while ensuring client state stays consistent with backend data stored in SQLite.

## Non-goals

-   Replacing the UI state model.
-   Advanced offline support.

## Definition of Done

-   [x] Client updates UI immediately for board/list/card/relationship mutations.
-   [x] Server responses reconcile local state (ids, timestamps, validation errors).
-   [x] Failures surface user-facing feedback consistent with UX patterns.
-   [x] Rollback behavior is defined for rejected updates.
-   [ ] Acceptance tests passed
-   [ ] Backend tests pass
-   [ ] Client tests pass

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact frontend test command(s); store logs under `client/logs/`.
-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.

## Notes (edge cases, hazards, perf constraints)

-   Avoid double-applying updates when optimistic and server states converge.
-   Confirm list/card ordering remains stable after reconciliation.
-   Reconciliation must respect server-assigned SQLite primary keys/guids where applicable.
