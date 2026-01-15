# S001-Backend Support Discovery + Plan

Conform to `docs/principles.md`.

## Summary

Analyze current client-only data flow and draft the plan required to add basic backend support, including API contract, migration steps, and test strategy changes.

## Why

Backend support will unlock persistence and multi-user readiness, but requires careful sequencing to avoid breaking existing UI flows and tests.

## Goal

Deliver a concrete plan that outlines what to build, in what order, with clear testing implications and risk mitigation.

## Non-goals

-   Implementing backend endpoints or persistence.
-   Migrating the app from mock data to backend.
-   Introducing auth/permissions beyond placeholders.

## Definition of Done

-   [x] Document current frontend data flow and service boundaries.
-   [x] Draft API contract for core entities (boards, lists, cards, relationships).
-   [x] Outline data model mapping between frontend and backend at a high level (entities + relationships).
-   [x] Define a migration sequencing overview (phases and handoff points only, no JSON/SQLite details).
-   [x] Define updated testing strategy and logging expectations.
-   [x] Identify risks/dependencies and propose a milestone breakdown for implementation.

## Acceptance tests (exact commands + expected artifacts/output)

-   N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)

-   Keep the plan aligned to FastAPI backend decisions in `docs/decisions.md`.
-   Avoid specifying auth details beyond minimal assumptions.

## Current frontend data flow + service boundaries

### Data source and loading

-   `client/src/app/services/board.service.ts` loads board data via the backend API (`/api/boards`, `/api/boards/{boardId}/snapshot`).
-   The initial payload shape is `BoardsResponse` (`client/src/app/models/board.model.ts`), containing `boards`, `cards`, `cardRelationships`, and `boardRelationships`.
-   `BoardService.loadBoard()` de-duplicates the initial fetch using `hasLoaded`, updates in-memory state, and emits `boardLoaded$` via a `BehaviorSubject`.
-   Failure mode is a local error string (`error = 'Unable to load board data.'`) and `loading` toggles; no retry or backoff logic today.

### In-memory state ownership (client-only)

-   `BoardService` is the source of truth for:
    -   Current board selection (`board`, `selectedCard`), editing state, panel drafts, and error strings.
    -   Core collections (`boards`, `cardsById`, `cardRelationships`, `boardRelationships`) and ordering arrays (`boardOrder`, `pinnedOrder`, `archivedOrder`).
    -   Derived UI state (rollups, list view mode, list-row expansion, completion state, list-move comments).
-   Components consume and mutate state directly through service methods or fields:
    -   Board view (`client/src/app/board/board.component.ts`)
    -   Board list/card components (`client/src/app/board/list/board-list.component.ts`, `client/src/app/board/card/board-card.component.ts`)
    -   Card panel (`client/src/app/board/card-panel/card-panel.component.ts`)
    -   Board gallery (`client/src/app/board-gallery/board-gallery.component.ts`)

### UI state services

-   `BoardPanelStateService` (`client/src/app/services/board-panel-state.service.ts`) owns board-panel open state, archive view state, and sort behavior.
-   `HierarchyPanelStateService` (`client/src/app/services/hierarchy-panel-state.service.ts`) owns hierarchy panel/drawer state, edit mode, and parent selection errors.
-   `BoardGalleryStateService` (`client/src/app/services/board-gallery-state.service.ts`) stores last-opened timestamps and gallery sort mode in `localStorage`.
-   `MarkdownService` (`client/src/app/services/markdown.service.ts`) renders markdown safely for card previews/panel content; UI-only concern.

### Routing and selection flow

-   Board + card routing triggers selection in `BoardComponent` (`client/src/app/board/board.component.ts`) via `ActivatedRoute` params:
    -   `/boards/:boardId` selects board, closes card panel.
    -   `/boards/:boardId/cards/:cardId` selects board, opens card panel if card exists.
-   Navigation uses `Router` and is driven by user actions (card click, board gallery selection).

## Draft API contract (core entities)

### Conventions

-   Base path: `/api` (served by FastAPI, per `docs/decisions.md`).
-   JSON error shape (consistent across endpoints):
    ```json
    {
    	"error": {
    		"code": "not_found",
    		"message": "Board not found.",
    		"details": {}
    	}
    }
    ```
-   Auth: none (placeholder). If needed later, include an optional `X-Actor-Id` header to tag activity without enforcing permissions.
-   `guid` fields are UUID4 strings, required and unique per table.

### Boards

-   `GET /api/boards`
    -   Returns lightweight board summaries for gallery (id, title, createdAt, description, pinned, archived, rollupsEnabled).
-   `guid` is included in all board responses.
-   `GET /api/boards/{boardId}`
    -   Returns a single board with `lists` and `cardIds` for list ordering.
-   `guid` is included for boards and lists.
-   `POST /api/boards`
    -   Creates a new board (title, description optional). Returns full board.
-   `guid` is generated server-side and returned in the payload.
-   `PATCH /api/boards/{boardId}`
    -   Updates title, description, rollupsEnabled, pinned, archived.
-   `DELETE /api/boards/{boardId}`
    -   Archives or deletes a board (decide on soft-delete vs. hard-delete in implementation).
-   `PATCH /api/boards/{boardId}/list-order`
    -   Reorders list ids on a board.

### Lists

-   `POST /api/boards/{boardId}/lists`
    -   Creates list on a board (title, isProcessDone).
-   `guid` is generated server-side and returned in the payload.
-   `PATCH /api/lists/{listId}`
    -   Updates list title and done-state.
-   `DELETE /api/lists/{listId}`
    -   Removes list from a board.
-   `PATCH /api/lists/{listId}/card-order`
    -   Reorders card ids in a list.

### Cards

-   `POST /api/cards`
    -   Creates a card (title, description). Returns full card.
-   `guid` is generated server-side and returned in the payload.
-   `GET /api/cards/{cardId}`
    -   Returns a single card (title, description, status, comments, timestamps).
-   `guid` is included in card and comment payloads.
-   `PATCH /api/cards/{cardId}`
    -   Updates title, description, status, timestamps.
-   `DELETE /api/cards/{cardId}`
    -   Deletes a card (and implicitly removes list memberships).
-   `POST /api/lists/{listId}/cards`
    -   Adds an existing card id to a list (support multi-board membership).
-   `DELETE /api/lists/{listId}/cards/{cardId}`
    -   Removes a card from a list.

### Relationships

-   `POST /api/card-relationships`
    -   Creates card parent/child relationship `{ parentCardId, childCardId }`.
-   `DELETE /api/card-relationships/{parentCardId}/{childCardId}`
    -   Removes card relationship.
-   `POST /api/board-relationships`
    -   Creates board parent/child relationship `{ parentBoardId, childBoardId }`.
-   `DELETE /api/board-relationships/{parentBoardId}/{childBoardId}`
    -   Removes board relationship.

### Optional aggregation (to reduce round-trips)

-   `GET /api/boards/{boardId}/snapshot`
    -   Returns `{ board, cards, cardRelationships, boardRelationships }` for the board view, matching frontend needs.
    -   Intended to reduce initial load latency and aligns with current `BoardsResponse` shape.
-   `guid` is included for boards, lists, cards, and comments in the snapshot payload.

## Data model mapping (frontend -> backend)

### Frontend snapshot (today)

-   `Board` embeds `lists`, which contain `cardIds` (ordering is stored on the list).
-   `Card` is a global entity; a card can exist on multiple boards via list membership.
-   `CardRelationship` and `BoardRelationship` are standalone collections with `createdAt`.
-   Comments live inside the `Card` object (`comments: CardComment[]`).

### Proposed backend shape (normalized)

| Concept            | Frontend            | Backend                                                                                    |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------ |
| Board              | `Board`             | `boards` table (id, guid, title, description, created_at, pinned, archived, rollups_enabled) |
| List               | `BoardList`         | `lists` table (id, guid, board_id, title, is_process_done, position)                       |
| Card               | `Card`              | `cards` table (id, guid, title, description, status_state, completed_at, created_at, updated_at) |
| List membership    | `BoardList.cardIds` | `list_cards` join table (list_id, card_id, position)                                       |
| Card relationship  | `CardRelationship`  | `card_relationships` table (parent_card_id, child_card_id, created_at)                     |
| Board relationship | `BoardRelationship` | `board_relationships` table (parent_board_id, child_board_id, created_at)                  |
| Comments           | `CardComment[]`     | `card_comments` table (id, guid, card_id, message, author_type, created_at)                |

Notes:

-   The backend should preserve ordering via explicit `position` fields for lists and list cards.
-   `BoardService` currently creates ids in-memory; backend must own id generation once migration starts.
-   `guid` fields are UUID4 compliant identifiers used for cross-system uniqueness; they do not replace existing ids.

## Migration sequencing overview (high level)

Phase 0: Discovery and contract (this spec)

-   Document current data flow, define API contract, and align data model mapping.

Phase 1: Read-only backend parity

-   Implement backend read endpoints (`GET /api/boards`, `/api/boards/{id}`, `/api/boards/{id}/snapshot`).
-   Remove client feature flag or environment switch; client reads from backend API by default.
-   Keep writes in-memory (no server writes yet) to reduce risk.

Phase 2: Write endpoints + optimistic client updates

-   Add create/update/delete endpoints for boards, lists, cards, and relationships.
-   Client continues to update UI immediately, then reconciles server responses.
-   Define server-side validation rules aligned with existing client-side constraints (title length, etc.).

Phase 3: Hardening + cleanup

-   Remove mock data dependency from the client; backend seeding uses `backend/server/assets/seed-2026-01-13.json`.
-   Add conflict/edge-case handling (duplicate ids, list membership drift).
-   Review local-only data (gallery sort mode, last-opened timestamps) for server sync or keep as client-only.

## Testing strategy + logging expectations

### Frontend

-   Unit tests: keep service logic coverage in `BoardService` and panel state services.
-   E2E: continue Playwright coverage with state-change assertions; store logs in `client/logs/`.
-   Add network stubs/mocks in tests only when backend is not required.

### Backend (FastAPI)

-   Unit/integration: FastAPI TestClient for endpoints, request/response validation, and error shapes.
-   Contract checks: ensure payloads match frontend expectations (board snapshot shape and list/card ordering).
-   Logs: store backend test outputs under `server/logs/` (new folder) to match `client/logs/` convention.

## Risks + dependencies

-   Data shape mismatch: `BoardsResponse` vs. resource endpoints could force larger UI changes if not planned.
-   Ordering integrity: list and card ordering must be preserved and stable across writes.
-   Multi-board card membership: deletions must clean up list membership and relationships safely.
-   Local storage data (last-opened, gallery sort) may drift from backend if later synced.
-   Performance: board snapshots could become large; consider pagination or partial fetches in later milestones.
-   Concurrency: race conditions between optimistic UI updates and server validation responses.

## Milestone breakdown proposal (M011 only)

### Planning + backend readiness

-   S001: Discovery + plan (this document).
-   S002: JSON to SQLite migration plan (schema + migration steps).

### Backend foundations

-   S003: Implement read endpoints + board snapshot.
-   S004: Client flag to switch data source.

### Write support

-   S005: Board/list/card CRUD endpoints.
-   S006: Relationship endpoints + server-side validation.
-   S007: Client optimistic updates + reconciliation.

### Hardening

-   S008: Remove mock data path; add retry/error states.
-   S009: Performance + logging improvements, basic contract checks.

### Review + audit

-   S010: Hallucination guardrails + source-of-truth validation.
    -   Require file/endpoint references for all backend plan assertions.
    -   Add a checklist that maps each planned endpoint to current frontend usage.
-   S011: Regression verification strategy.
    -   Define required regression checks (unit + E2E) and log locations (`client/logs/`, `server/logs/`).
    -   Specify minimum assertions for state changes tied to boards/lists/cards/relationships.
-   S012: Data consistency checks.
    -   Define consistency checks for ordering, membership, and relationship integrity.
    -   Specify where checks live (service helpers, backend validation) and how failures are surfaced.
