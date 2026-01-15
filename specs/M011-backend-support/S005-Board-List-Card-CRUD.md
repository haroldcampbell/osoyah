# S005-Board/List/Card CRUD Endpoints

Conform to `docs/principles.md`.

## Summary

Implement backend write endpoints for boards, lists, and cards to support creation, updates, deletion, and ordering, persisted in SQLite via SQLAlchemy ORM with Alembic migrations. Refactor backend modules for clearer separation (API routes, services, DB, schemas, config) and document the module structure.

## Goal

Provide API coverage for all board/list/card mutations currently performed in the client, backed by SQLite persistence seeded from `backend/server/assets/seed-2026-01-13.json` on first run.

## Non-goals

-   Client-side optimistic updates (covered in S007).
-   Auth/permissions beyond placeholders.
-   Data migrations beyond API persistence.

## Definition of Done

-   [x] CRUD endpoints exist for boards, lists, and cards with documented payloads.
-   [x] Ordering updates are supported for lists and list cards.
-   [x] Server validations align with existing client constraints (title length, required fields).
-   [x] Error responses follow the agreed JSON error shape.
-   [x] `guid` fields are generated server-side, required, and unique per table.
-   [x] Writes persist via SQLAlchemy models to the SQLite database defined in S002.
-   [x] Alembic is configured and used to manage schema changes.
-   [x] SQLite file lives under `backend/server/assets/` and is seeded on first run.
-   [x] Backend modules are refactored for separation of concerns (api routes, services, db, schemas, config).
-   [x] Module structure is documented in `backend/server/README.md`.

Note: Helper scripts added for this spec include `backend/scripts/app.py` (run the API) and `backend/scripts/coverage.py` (run tests with coverage).

## Acceptance tests (exact commands + expected artifacts/output)

-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure deletes hard-delete records and clean up list membership to avoid orphaned references.
-   Preserve card multi-board membership semantics.
-   Enforce `guid` uniqueness with database constraints.
-   Use SQLAlchemy transactions to keep list/card ordering updates consistent.
