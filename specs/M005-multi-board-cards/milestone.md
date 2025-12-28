# M005-Multi-Board Cards: Shared Work Items

Conform to `docs/principles.md`.

## Summary
Enable cards to live on multiple boards with no primary board, so work items can move across pipelines without duplication.

## Goal
Support cross-board card membership and navigation while keeping board behavior familiar.

## Scope
In-scope:
- Global card identity and many-to-many board membership.
- UI to attach an existing card to another board.
- Membership indicators and navigation between boards.
Out-of-scope:
- Server persistence or multi-user collaboration.
- Board hierarchy or roll-up metrics (handled in later milestones).

## Specs
- [x] S001-Global Card Identity + Board Memberships
- [ ] S002-Add Existing Card to Board
- [ ] S003-Membership Indicators + Navigation
- [ ] S004-Board Selection + CRUD

## Notes
- Board lists remain the stage model for pipeline boards.
