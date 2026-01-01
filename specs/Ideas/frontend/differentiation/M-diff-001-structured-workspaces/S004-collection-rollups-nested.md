# S004-Collection Rollups (Nested): Hierarchy Reporting

Conform to `docs/principles.md`.

## Summary
Support nested collections for reporting rollups so agencies can group related work types and see aggregate metrics without changing permissions.

## Goal
Users can create parent/child collections and view rollups such as card counts, status distribution, and totals of numeric fields.

## Non-goals
- Collection-level permission overrides.
- Cross-workspace rollups.
- Advanced analytics or BI exports.

## Dependencies
- M-diff-001-S003 (Collection Schemas + Types)

## Definition of Done
- [ ] Collections can be nested with a single parent per collection.
- [ ] Parent collections show rollup summaries from all descendant collections.
- [ ] Rollups include: total cards, cards by status, and numeric field sums.
- [ ] Rollups are read-only and do not modify child data.
- [ ] UI clarifies that nesting is for reporting only.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Parent collection summary renders rollup metrics.
  - UI indicates “reporting only” for nested collections.
- `npm run e2e`
  - Create child collections → cards → parent rollup updates.
  - Moving a board between collections updates rollups.

## Notes (edge cases, hazards, perf constraints)
- Rollup computations should be incremental; avoid full scans on each render.
- Prevent circular collection references.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
