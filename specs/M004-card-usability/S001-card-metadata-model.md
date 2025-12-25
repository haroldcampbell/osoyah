# S001-Card Metadata Model: Descriptions, Comments, Created Date

Conform to `docs/principles.md`.

## Summary
Extend the card model and mock data to support descriptions, comments/posts, and created/updated timestamps.

## Goal
Provide the data foundation required for information-dense cards and a detailed card view.

## Non-goals
- Persistence beyond in-memory state.
- Multi-user attribution, permissions, or realtime updates.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)
- Data model additions (exact fields):
  - Card: `description: string`, `createdAt: string`, `updatedAt: string`, `comments: CardComment[]`
  - CardComment: `id: string`, `message: string`, `createdAt: string`
- Use ISO-8601 strings (UTC) for timestamps.
- For mock data, keep `createdAt`/`updatedAt` deterministic (fixed values), and ensure `updatedAt` >= `createdAt`.
- Comments should be stored in chronological order (oldest-first) so rendering is stable.
- Comments can be added and deleted in-memory; deletion should remove the comment object by id.
- Do not break existing drag-and-drop or list/card ordering behavior.
