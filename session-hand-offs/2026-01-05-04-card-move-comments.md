# 2026-01-05-04-card-move-comments

## Summary
- Added list-move system comments for drag/drop and list picker with from/to list names and a board link.
- Fixed multi-board link bug by using the active board context for the comment link.
- Added unit coverage for move-comment content and board link correctness.

## Work Completed
- Centralized list-move comment creation in the board service and called it from drag/drop + list picker moves.
- Ensured move comment precedes done-status comment when moving into/out of done lists.
- Removed the ad-hoc comment in card panel completion flow to avoid duplicates.
- Added unit tests to validate move comments and board link context.

## Tests
- User ran `npm run lint` (pass; `client/logs/lint.log`).
- User ran `npm run test` (pass; `client/logs/test.log`).
- User ran `npm run e2e` (pass; `client/logs/e2e.log`).

## Follow-ups
- Review and tighten two E2E assertions to avoid potential false positives:
  - `client/e2e/inline-edit.spec.ts` card-title edit check may pass if another card already has the same text.
  - `client/e2e/card-panel.spec.ts` list picker test only checks the trigger label, not card relocation.

## Notes
- Acceptance tests passed; ready for user commit.
