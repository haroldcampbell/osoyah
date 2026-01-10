# S006-Relationship Endpoints + Validation

Conform to `docs/principles.md`.

## Summary

Implement backend endpoints and validations for card and board relationships, matching current client behavior, persisted in SQLite via SQLAlchemy ORM.

## Goal

Support parent/child relationships with cycle prevention and depth checks consistent with the frontend, backed by SQLite persistence.

## Non-goals

-   UI changes to relationship management.
-   Auth/permissions beyond placeholders.

## Definition of Done

-   [x] Endpoints exist for creating and removing card relationships.
-   [x] Endpoints exist for creating and removing board relationships.
-   [x] Validation prevents self-links, cycles, and depth violations.
-   [x] Relationship creation timestamps are stored server-side.
-   [x] Error responses follow the agreed JSON error shape.
-   [x] Relationship payloads do not add separate `guid` fields (revisit if relationships become first-class entities).
-   [x] Relationship writes persist via SQLAlchemy models to SQLite.

## Acceptance tests (exact commands + expected artifacts/output)

-   `python backend/scripts/lint.py`
    -   Writes `backend/server/logs/lint.log`.
-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   `python backend/scripts/coverage.py`
    -   Writes `backend/server/logs/coverage.log`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure unlink operations cleanly remove references without side effects.
-   Maintain consistency with frontend helper rules in `BoardService`.
-   If relationships become first-class entities (metadata, audit, or comments), revisit adding `guid` values.
-   Use SQLite constraints (unique pairs) to prevent duplicate relationships.
