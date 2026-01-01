# S003-Card Watching + Notifications Inbox

Conform to `docs/principles.md`.

## Summary
Let users watch cards and view a notifications inbox for activity on watched cards.

## Goal
Surface important changes without requiring users to scan the full board feed.

## Non-goals

- Email or push delivery.
- Multi-user attribution or per-user permissions.
- Notification rules beyond watched-card activity.

## Definition of Done

- [ ] Card detail panel includes a Watch toggle and watch state persists locally.
- [ ] Watched cards show a subtle indicator on the card surface.
- [ ] Global header includes a Notifications entry with unread count.
- [ ] Inbox lists activity events from watched cards newest-first.
- [ ] Opening a notification focuses the card and opens the card panel if available.
- [ ] Unread state clears when an item is opened; a "Mark all read" action exists.
- [ ] Watching preferences persist in local storage.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- If a watched card is removed, show prior events but drop future notifications for it.
- Unread counts should not include activity older than the last read timestamp.
