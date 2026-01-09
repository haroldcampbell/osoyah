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
- [ ] Map JSON structures to SQL tables with key constraints.
- [ ] Define the migration flow (input, transformation, output, verification).
- [ ] Specify how to preserve board/list/card ordering and relationships.
- [ ] Provide a regression testing plan (unit + integration + e2e expectations).
- [ ] Identify required diagnostics/log outputs (e.g., migration report).

## Acceptance tests (exact commands + expected artifacts/output)
- N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)
- Preserve ids (`board-*`, `list-*`, `card-*`) to keep links stable.
- Model relationships in separate tables (card/board relationships).
- Include a checksum or counts report to validate record parity.
