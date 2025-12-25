# S003-Mock API + Models + Sample Data

Conform to `docs/principles.md`.

## Summary
Create a file-based mock API using `assets/data.json` and typed models for Board, List, Card.

## Goal
Allow the UI to fetch realistic sample data via `HttpClient` while mirroring the future API shape.

## Non-goals
- Persist data changes to disk
- Implement authentication or authorization

## Acceptance tests (exact commands + expected artifacts/output)
- `ng serve` loads without errors
- A service uses `HttpClient` to read `assets/data.json`
- TypeScript interfaces exist for Board, List, Card
- Sample data matches the interface shapes and is used by the service

## Notes (edge cases, hazards, perf constraints)
- Keep DTOs close to expected backend responses to ease migration.
- Avoid business logic in the mock service; keep it read-only.
