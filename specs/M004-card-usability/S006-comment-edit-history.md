# S006-Comment Edit History: Audit + Restore

Conform to `principles.md`.

## Summary
Add edit tracking for comments, showing prior versions and when edits occurred.

## Goal
Let users audit how a comment changed over time without leaving the card detail view.

## Non-goals
- Multi-user attribution or permissions.
- External audit logging or export.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)
- Data model additions (exact fields):
  - CardComment: `updatedAt: string`, `edits: CardCommentEdit[]`
  - CardCommentEdit: `id: string`, `message: string`, `editedAt: string`
- When editing a comment, append a `CardCommentEdit` entry with the prior message and timestamp.
- Comments show an "edited" indicator with the last edited time.
- Edit history is collapsible per comment and shows prior messages verbatim in chronological order.
- The first entry should be labeled as the original message.
- Keep all edit history entries in memory (no trimming).
