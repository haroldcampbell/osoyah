# 2025-12-30-01-board-routing

## Summary
- Implemented board + card deep linking with Angular router and URL sync.
- Added 404-style board banner and in-board card-not-found notice.
- Added unit tests that validate route param changes update board/card state.
- Preserved in-memory board/card changes across route navigation to keep E2E flows stable.
- Acceptance tests pass (lint, format check, e2e).

## Work Completed
- Added routes for `/boards/:boardId` and `/boards/:boardId/cards/:cardId`, plus router outlet wiring.
- Synced board/card selection with URL updates and route-driven state updates.
- Added invalid board banner, in-board card-not-found notice, and supporting actions.
- Updated unit tests to cover board/card routing state and not-found behavior.
- Avoided reloading board data after initial load to keep local CRUD changes across deep links.

## Decisions
- Show invalid board banner within the board view, while allowing navigation to valid boards.
- Use a dedicated card-not-found panel when a card ID is invalid for a valid board.

## Open Questions
- None.

## Outstanding (M005)
- None.

## Next Steps
- Run the acceptance tests and capture logs in `client/logs/`.
- Update `specs/M005-multi-board-cards/S006-board-routing-deep-links.md` DoD checkboxes after verification.
