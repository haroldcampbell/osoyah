# S001-Global Card Identity + Board Memberships: Multi-Board Core

Conform to `docs/principles.md`.

## Summary
Introduce global card IDs and a many-to-many board membership model so cards can appear on multiple boards without a primary.

## Goal
Allow a single card to be referenced across multiple boards while preserving current list ordering behavior.

## Non-goals
- Backend persistence.
- Cross-board hierarchy or roll-ups.

## Definition of Done
- [ ] Cards have stable global IDs distinct from list-level ordering.
- [ ] Board data supports multiple board memberships per card.
- [ ] Existing single-board flows continue to work.
- [ ] Mock data updated to exercise multi-board membership.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Prefer additive data structures to avoid breaking existing ordering logic.
