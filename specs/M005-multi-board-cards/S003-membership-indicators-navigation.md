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
- [x] Card side panel shows all board memberships.
- [x] Users can jump to a selected board from the side panel.
- [x] Membership list is readable on narrow viewports.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep membership UI in the side panel only.

## Decisions (implementation detail)
- Navigation swaps the active board in the main view and keeps the side panel open on the same card when possible.
- Membership list shows board names only; do not show list names/locations.
- Highlight the current board in the membership list with a simple "Current" tag.
- For narrow viewports, use wrapping or horizontal scroll to keep the list readable.
