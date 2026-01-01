# S002-Guided Onboarding: First Value Flow

Conform to `docs/principles.md`.

## Summary
A guided first-run flow that creates a board from a template and teaches key actions: create/update card, assign owner, interpret trust signals.

## Goal
Users reach a first value moment (board created + first card updated) in under 5 minutes.

## Non-goals
- Long, modal-heavy tutorials.
- Interactive walkthroughs that require constant maintenance.

## Dependencies
- M-diff-003-S001 (Project Templates)
- M-diff-002-S001 (Trust Signals)
- M-diff-000-S002 (Card Ownership Model)

## Definition of Done
- [ ] Onboarding can be skipped and resumed later.
- [ ] Flow creates a board from a selected template.
- [ ] Flow teaches: create card, assign owner, observe trust signal change.
- [ ] UI shows predictable loading/empty/error states.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Onboarding screens render with accessible navigation.
  - Skip/resume behavior is covered.
- `npm run e2e`
  - Full onboarding flow creates a board and updates a card.

## Notes (edge cases, hazards, perf constraints)
- Avoid auto-creating content the user did not confirm.
- Ensure keyboard navigation works for every step.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
