# 2026-01-05-05-e2e-assertion-hardening

## Summary
- Hardened two E2E assertions to avoid false positives for card title edits and list picker moves.
- Added testing guidance to decisions/process docs and captured a learning entry.

## Work Completed
- Scoped inline card title edit assertions to the edited card via `data-card-id`.
- Verified list picker moves by asserting card presence in the target list and absence in the source list.
- Documented E2E assertion guidelines and a false-positive checklist.
- Logged a testing learning entry.

## Tests
- User ran `npm run lint` (pass; `client/logs/lint.log`).
- User ran `npm run test` (pass; `client/logs/test.log`).
- User ran `npm run e2e` (pass; `client/logs/e2e.log`).

## Follow-ups
- None.

## Notes
- Spec S009 complete; ready for user commit.
