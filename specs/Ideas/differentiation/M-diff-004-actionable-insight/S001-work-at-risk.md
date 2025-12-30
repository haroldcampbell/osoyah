# S001-Work At Risk: Explainable Risk View

Conform to `docs/principles.md`.

## Summary
Provide a “Work at risk” view that highlights cards or boards likely to slip based on simple, transparent heuristics (overdue + stale + dependency blocked + missing owner).

## Goal
Users can identify and triage risk in under 60 seconds without building dashboards.

## Non-goals
- ML forecasting.
- Burn-down charts or portfolio tooling.
- Custom risk rule builders.

## Dependencies
- M-diff-002-S001 (Trust Signals)
- M-diff-000-S002 (Card Ownership Model)
- M-diff-000-S003 (Card Due Dates)
- M006-S001 (Parent-Child Links: Single Parent)

## Definition of Done
- [ ] Risk rules are deterministic and documented.
- [ ] Risk view lists items with risk level and explicit reasons.
- [ ] Clicking a reason filters to the causing cards.
- [ ] UI handles loading/empty/error states.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Risk list renders with risk level and reasons.
  - Filters narrow to the exact causing cards.
- `npm run e2e`
  - Overdue + missing owner raises risk to HIGH.
  - Clearing the issue removes the risk flag.

## Notes (edge cases, hazards, perf constraints)
- Every risk flag must cite the triggering rule.
- Keep the computation incremental for large boards.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
