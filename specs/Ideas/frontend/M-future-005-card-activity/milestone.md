# M-future-005-Card Activity: Feed + Watching + Summaries

Conform to `docs/principles.md`.

## Summary
Define a frontend milestone to track card activity events and surface them through board feeds, watch-based notifications, and summary drafts.

## Goal
Make card activity visible and actionable in the UI, laying groundwork for notifications and email summaries.

## Scope
In-scope:
- Frontend activity event model with board + card linkage.
- Board-level activity feed UI.
- Card watching controls and a notifications inbox for watched activity.
- Summary draft view for activity digests.
Out-of-scope:
- Backend persistence, webhooks, or email delivery.
- Multi-user attribution, permissions, or realtime presence.
- Cross-board analytics beyond activity summaries.

## Specs
- [ ] S001-Activity event model
- [ ] S002-Board activity feed
- [ ] S003-Card watching + notifications inbox
- [ ] S004-Activity summary draft

## Notes
- Activities should be ordered, filterable, and linked back to cards.
- Local storage can be used for preferences until backend storage exists.
