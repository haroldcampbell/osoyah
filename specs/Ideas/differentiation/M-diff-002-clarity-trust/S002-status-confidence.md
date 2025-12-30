# S002-Status Confidence: Rollup Confidence Labels

Conform to `docs/principles.md`.

## Summary
Provide a simple HIGH / MEDIUM / LOW confidence label for boards or rollups based on trust signals, with explicit reasons.

## Goal
In any rollup view, users see a confidence label plus reasons that are consistent and testable.

## Non-goals
- Forecasting or delivery predictions.
- Configurable rule engines.
- Portfolio-level analytics.

## Dependencies
- M-diff-002-S001 (Trust Signals)

## Definition of Done
- [ ] Confidence labels derive only from trust signals and documented rules.
- [ ] Rollup views show confidence labels with a short explanation list.
- [ ] Confidence labels are stable for identical inputs (deterministic).
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Confidence labels render in rollup widgets and headers.
  - Tooltip or detail list shows the reasons.
- `npm run e2e`
  - Increasing stale ratio moves confidence from HIGH to MEDIUM.
  - Clearing missing owners returns confidence to HIGH.

## Notes (edge cases, hazards, perf constraints)
- Default to HIGH for very small datasets unless critical signals exist.
- Keep reasons short and specific (e.g., “3 stale cards”).
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
