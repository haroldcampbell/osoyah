# S003-Membership Indicators + Navigation: Multi-Board Awareness

Conform to `docs/principles.md`.

## Summary
Surface board membership and provide navigation between boards that share a card.

## Goal
Help users understand where a card exists and jump between its boards.

## Non-goals
- Card tile badges outside the side panel.
- Board hierarchy navigation (handled in M007).

## Definition of Done
- [ ] Card side panel shows all board memberships.
- [ ] Users can jump to a selected board from the side panel.
- [ ] Membership list is readable on narrow viewports.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep membership UI in the side panel only.
