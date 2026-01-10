# S005-Board/List/Card CRUD Endpoints

Conform to `docs/principles.md`.

## Summary

Implement backend write endpoints for boards, lists, and cards to support creation, updates, deletion, and ordering.

## Goal

Provide API coverage for all board/list/card mutations currently performed in the client.

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

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact backend test command(s); store logs under `server/logs/`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure deletes clean up list membership to avoid orphaned references.
-   Preserve card multi-board membership semantics.
-   Enforce `guid` uniqueness with database constraints.
