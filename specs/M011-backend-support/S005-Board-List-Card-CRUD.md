# S005-Board/List/Card CRUD Endpoints

Conform to `docs/principles.md`.

## Summary

Implement backend write endpoints for boards, lists, and cards to support creation, updates, deletion, and ordering, persisted in SQLite via SQLAlchemy ORM.

## Goal

Provide API coverage for all board/list/card mutations currently performed in the client, backed by SQLite persistence.

## Non-goals

-   Client-side optimistic updates (covered in S007).
-   Auth/permissions beyond placeholders.
-   Data migrations beyond API persistence.

## Definition of Done

-   [ ] CRUD endpoints exist for boards, lists, and cards with documented payloads.
-   [ ] Ordering updates are supported for lists and list cards.
-   [ ] Server validations align with existing client constraints (title length, required fields).
-   [ ] Error responses follow the agreed JSON error shape.
-   [ ] `guid` fields are generated server-side, required, and unique per table.
-   [ ] Writes persist via SQLAlchemy models to the SQLite database defined in S002.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact backend test command(s); store logs under `backend/server/logs/`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure deletes clean up list membership to avoid orphaned references.
-   Preserve card multi-board membership semantics.
-   Enforce `guid` uniqueness with database constraints.
-   Use SQLAlchemy transactions to keep list/card ordering updates consistent.
