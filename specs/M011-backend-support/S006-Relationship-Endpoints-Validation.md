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

-   [ ] Endpoints exist for creating and removing card relationships.
-   [ ] Endpoints exist for creating and removing board relationships.
-   [ ] Validation prevents self-links, cycles, and depth violations.
-   [ ] Relationship creation timestamps are stored server-side.
-   [ ] Error responses follow the agreed JSON error shape.
-   [ ] Relationship payloads include `guid` values when returned.
-   [ ] Relationship writes persist via SQLAlchemy models to SQLite.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact backend test command(s); store logs under `backend/server/logs/`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure unlink operations cleanly remove references without side effects.
-   Maintain consistency with frontend helper rules in `BoardService`.
-   If relationship rows include `guid`, enforce UUID4 format and uniqueness.
-   Use SQLite constraints (unique pairs) to prevent duplicate relationships.
