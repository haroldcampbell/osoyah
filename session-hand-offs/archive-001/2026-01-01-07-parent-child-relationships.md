# 2026-01-01-07-parent-child-relationships

## Summary
- Added a card relationship model with created timestamps and mock data coverage for a cross-board parent/child example.

## Work Completed
- Introduced `CardRelationship` model and added `cardRelationships` to the board data response.
- Stored relationships in `BoardService` and added a helper for creating relationships with `createdAt`.
- Updated mock data with a cross-board parent/child relationship and new card entry.
- Marked S001 DoD complete after acceptance tests passed.

## Decisions
- Parent/child links are represented as a separate relationship collection (not embedded on cards).

## Open Questions
- None.

## Outstanding
- None for S001; S002 will handle relationship integrity (cycle prevention).

## Tests
- `npm run lint`
- `npm run format:check`
- `npm run e2e`

## Next Steps
- Review S002 relationship integrity spec for cycle prevention rules.
