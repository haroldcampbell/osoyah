# S001-Trust Signals: Freshness + Completeness Indicators

Conform to `docs/principles.md`.

## Summary
Attach clear, explainable trust indicators to cards and boards (e.g., “Stale”, “Missing owner”, “Broken link”, “Needs review”) so users can assess reliability at a glance.

## Goal
Users can answer “Do I trust what I’m seeing?” in under 10 seconds for any card or board view.

## Non-goals
- ML/AI-based scoring.
- Enterprise-grade audit trails.
- Real-time presence indicators.

## Dependencies
- M004-S001 (Card Metadata Model)
- M-diff-000-S002 (Card Ownership Model)

## Definition of Done
- [ ] Trust signals are computed from explicit rules (freshness, ownership, completeness).
- [ ] Cards and boards display trust badges with short explanations.
- [ ] Trust signals are visible in list rows and detail panels.
- [ ] Trust signals have predictable loading/empty/error states.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Components render trust badges with tooltips.
  - Loading/empty/error UI states exist for trust fields.
- `npm run e2e`
  - Creating a card without an owner shows “Missing owner”.
  - Updating a stale card clears the “Stale” signal.

## Notes (edge cases, hazards, perf constraints)
- Avoid false positives for “stale” when recent comments exist.
- If trust inputs are missing, show “Unknown” rather than hiding fields.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
