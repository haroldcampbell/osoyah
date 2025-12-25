# S009-[Nice-to-Have] Quick Actions: Reduce Clicks

Conform to `docs/principles.md`.

## Summary

Add lightweight quick actions on cards (e.g., add comment, edit description) to reduce clicks.

## Goal

Speed up common workflows without leaving the board.

## Non-goals

-   Full command palette or power-user mode.
-   Adding new card fields beyond M004 scope.

## Definition of Done
- [ ] Cards expose quick actions for adding a comment and editing the description.
- [ ] Quick actions do not interfere with drag handles or click-to-open behavior.
- [ ] Quick actions hide on small screens if they reduce readability.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.
