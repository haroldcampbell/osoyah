# S008-[Nice-to-Have] Quick Actions: Reduce Clicks

Conform to `principles.md`.

## Summary

Add lightweight quick actions on cards (e.g., add comment, edit description) to reduce clicks.

## Goal

Speed up common workflows without leaving the board.

## Non-goals

-   Full command palette or power-user mode.
-   Adding new card fields beyond M004 scope.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   Quick actions should not interfere with drag handles or card click-to-open behavior.
-   Hide actions on small screens if they reduce readability.
