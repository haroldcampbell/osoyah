# S007-Comment Edit History: Audit + Restore

Conform to `principles.md`.

## Summary
Add edit tracking for comments, showing prior versions and when edits occurred.

## Goal
Let users audit how a comment changed over time without leaving the card detail view.

## Non-goals
- Multi-user attribution or permissions.
- External audit logging or export.

## Definition of Done
- [ ] Comment data model includes updatedAt and edits fields; CardCommentEdit includes id, message, and editedAt.
- [ ] Editing a comment appends an edit entry with the prior message and timestamp.
- [ ] Comments show an edited indicator with the last edited time.
- [ ] Edit history is collapsible per comment and ordered chronologically.
- [ ] The original message is labeled in the history.
- [ ] Edit history entries are retained in memory without trimming.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.
