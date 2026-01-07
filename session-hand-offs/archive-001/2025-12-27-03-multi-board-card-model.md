# 2025-12-27-03-multi-board-card-model

## Summary
- Implemented S001 data model shift to global cards + board list memberships.
- Updated mock data for multi-board membership and added a second board.
- Added architecture data shape sketch for shared card state and per-board ordering.

## Work Completed
- Replaced list-embedded cards with `cardIds` and global card storage.
- Updated board service, templates, and unit tests to use shared cards.
- Documented data shape rules in `docs/architecture.md`.

## Decisions
- Cards are global entities; lists store `cardIds` for per-board ordering.
- Cards may appear on multiple boards but only once per board.

## Tests
- Not run (per process; acceptance tests deferred).
