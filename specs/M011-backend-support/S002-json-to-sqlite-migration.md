# S002-JSON to SQLite Migration Plan

Conform to `docs/principles.md`.

## Summary
Define the plan to migrate existing `data.json` mock data into a SQLite database, including schema mapping, migration flow, and regression testing.

## Why
Backend support needs an initial dataset. A repeatable migration plan reduces risk of data loss and ensures the UI continues to reflect the same board state.

## Goal
Provide a clear migration specification that preserves identifiers, relationships, and ordering while introducing SQL-friendly structure.

## Non-goals
- Implementing the migration script or database.
- Introducing new entities or changing data semantics.

## Definition of Done
- [x] Map JSON structures to SQL tables with key constraints.
- [x] Define the migration flow (input, transformation, output, verification).
- [x] Specify how to preserve board/list/card ordering and relationships.
- [x] Provide a regression testing plan (unit + integration + e2e expectations).
- [x] Identify required diagnostics/log outputs (e.g., migration report).

## Acceptance tests (exact commands + expected artifacts/output)
- N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)
- Preserve ids (`board-*`, `list-*`, `card-*`) to keep links stable.
- Model relationships in separate tables (card/board relationships).
- Include a checksum or counts report to validate record parity.

## Schema mapping (JSON -> SQLite)

### Source payload
- JSON source: `backend/server/assets/seed-2026-01-13.json` with `BoardsResponse` shape.
- Collections: `boards`, `cards`, `cardRelationships`, `boardRelationships`.

### Tables and constraints (proposal)
| JSON source | Table | Key fields | Notes |
| --- | --- | --- | --- |
| `boards[]` | `boards` | `id` (PK), `guid` (UNIQUE, NOT NULL), `title`, `description`, `created_at`, `pinned`, `archived`, `rollups_enabled` | Preserve ids from JSON; `guid` is UUID4. |
| `boards[].lists[]` | `lists` | `id` (PK), `guid` (UNIQUE, NOT NULL), `board_id` (FK -> boards.id), `title`, `is_process_done`, `position` | `position` reflects list order in board. |
| `boards[].lists[].cardIds[]` | `list_cards` | `list_id` (FK -> lists.id), `card_id` (FK -> cards.id), `position` | Represents list membership and ordering. |
| `cards[]` | `cards` | `id` (PK), `guid` (UNIQUE, NOT NULL), `title`, `description`, `created_at`, `updated_at`, `status_state`, `completed_at` | Preserve ids and timestamps; `guid` is UUID4. |
| `cards[].comments[]` | `card_comments` | `id` (PK), `guid` (UNIQUE, NOT NULL), `card_id` (FK -> cards.id), `message`, `author_type`, `created_at` | Preserve comment ids; `guid` is UUID4. |
| `cardRelationships[]` | `card_relationships` | `parent_card_id` (FK -> cards.id), `child_card_id` (FK -> cards.id), `created_at` | Unique pair constraint on (parent, child). |
| `boardRelationships[]` | `board_relationships` | `parent_board_id` (FK -> boards.id), `child_board_id` (FK -> boards.id), `created_at` | Unique pair constraint on (parent, child). |

Index guidance:
- `lists(board_id, position)`
- `list_cards(list_id, position)`
- `card_relationships(parent_card_id, child_card_id)`
- `board_relationships(parent_board_id, child_board_id)`

## Migration flow (input -> transformation -> output -> verification)

### Input
- Read `backend/server/assets/seed-2026-01-13.json`.
- Validate that required arrays exist; missing arrays treated as empty.

### Transformation
- Normalize boards and lists into separate tables.
- Derive `position` values from array order for lists and list card membership.
- Split embedded comments into `card_comments`.
- Ensure relationship tables are separate collections with `created_at` timestamps.
- Generate UUID4 `guid` values for boards, lists, cards, and comments.

### Output
- Write to SQLite database file (path defined in the implementation spec).
- Preserve ids and timestamps exactly as in JSON.
- Persist UUID4 `guid` values for each applicable table.

### Verification
- Compare counts between JSON and SQLite for each table.
- Validate ordering: list positions and list card positions match original JSON order.
- Validate referential integrity: no orphan list_cards, comments, or relationships.
- Verify UUID4 format for all `guid` fields.

## Ordering and relationship preservation

Ordering rules:
- `boards[].lists[]` order maps to `lists.position` (0-based or 1-based, but consistent).
- `boards[].lists[].cardIds[]` order maps to `list_cards.position`.
- Do not sort or re-order during migration.

Relationship rules:
- `card_relationships` and `board_relationships` must remain unchanged and unique.
- If duplicates exist in JSON, log and skip duplicates deterministically (first occurrence wins).

## Regression verification plan

### Unit/integration expectations (backend)
- Validate migration output counts and foreign key consistency.
- Confirm id preservation for boards/lists/cards/comments.
- Log results to `server/logs/` (e.g., `server/logs/migration-verify.log`).

### E2E expectations (frontend)
- Existing E2E suites should pass without change when running against migrated data.
- Logs remain in `client/logs/`.

Minimum pass criteria:
- Count parity achieved for all tables.
- No missing relationships or membership records.
- Ordering preserved for lists and list cards.

## Diagnostics and logging

Required artifacts (under `server/logs/`):
- `migration-report.json` with counts, timings, and checksum/hash values.
- `migration-verify.log` with validation results and any warnings.

Example report format:
```json
{
  "counts": {
    "boards": 4,
    "lists": 18,
    "cards": 240,
    "list_cards": 240,
    "card_comments": 75,
    "card_relationships": 12,
    "board_relationships": 3
  },
  "checksums": {
    "boards": "sha256:...",
    "lists": "sha256:...",
    "cards": "sha256:..."
  },
  "warnings": [],
  "duration_ms": 842
}
```

## Invariants checklist

- All ids preserved (board/list/card/comment/relationship).
- List and card ordering preserved exactly.
- Relationship integrity maintained (no cycles introduced by migration).
- Comment authorship preserved (`user`, `system`, `bot`).
- All `guid` values are UUID4 compliant and unique.
