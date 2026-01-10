# S003-Read Endpoints + Board Snapshot

Conform to `docs/principles.md`.

## Summary

Implement backend read endpoints for boards and board snapshots to enable a read-only backend parity phase.

## Goal

Serve board data from FastAPI with a response shape compatible with current frontend needs.

## Non-goals

-   Implementing write endpoints.
-   Replacing mock data in the running app.
-   Introducing auth/permissions beyond placeholders.

## Definition of Done

-   [x] `GET /api/boards` returns board summaries used by the gallery.
-   [x] `GET /api/boards/{boardId}` returns board lists with card ordering.
-   [x] `GET /api/boards/{boardId}/snapshot` returns `board`, `cards`, `cardRelationships`, `boardRelationships`.
-   [x] Error responses conform to the agreed JSON error shape.
-   [x] Response shapes are documented with example payloads.
-   [x] `guid` fields are included in all board/list/card/comment payloads.

## Acceptance tests (exact commands + expected artifacts/output)

-   `python backend/scripts/pytest.py`
    -   Writes `backend/server/logs/pytest.log`.
-   No frontend changes required for acceptance.

## Notes (edge cases, hazards, perf constraints)

-   Preserve list and card ordering explicitly in response payloads.
-   Snapshot response should be performant for current board sizes.
-   `guid` values are UUID4 and unique per table.
