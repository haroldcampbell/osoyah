# S006-Board Routing + Deep Links: Board + Card URLs

Conform to `docs/principles.md`.

## Summary

Introduce board and card deep links so URLs reflect the active board and selected card, enabling sharing and direct navigation.

## Goal

Allow users to navigate to `/boards/<board-id>` and `/boards/<board-id>/cards/<card-id>` with the app loading the matching board and card panel state.

## Non-goals

- Server-side routing or persistence.
- Permissions or access control.
- Board hierarchy or roll-ups (handled in later milestones).

## Definition of Done

- [ ] Navigating to `/boards/<board-id>` loads the matching board and updates the selector state.
- [ ] Navigating to `/boards/<board-id>/cards/<card-id>` loads the board and opens the matching card panel.
- [ ] Selecting a different board updates the URL to `/boards/<board-id>`.
- [ ] Opening a card updates the URL to `/boards/<board-id>/cards/<card-id>`.
- [ ] Closing the card panel returns the URL to `/boards/<board-id>`.
- [ ] Invalid board IDs show a 404 state with an error banner.
- [ ] Invalid card IDs under a valid board show a 404 state with an error banner.
- [ ] Existing single-board flows continue to work.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Keep URL updates in sync with in-memory state.
- Use existing board/card IDs (e.g. `board-1`, `card-1`) until persistent IDs exist.
- 404 state should resemble a banner-style error message (GitHub-style) without breaking layout.
