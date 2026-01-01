# S001-Activity Event Model: Board + Card Events

Conform to `docs/principles.md`.

## Summary
Define a frontend activity event model that links card actions to boards and supports feeds, notifications, and summaries.

## Goal
Provide a consistent, queryable activity stream that captures key card actions.

## Non-goals

- Backend persistence or API contracts.
- Multi-user attribution or permissions.
- Full audit logging or export.

## Definition of Done

- [ ] ActivityEvent model includes `id`, `boardId`, `cardId`, `type`, `createdAt`, and `summary` fields.
- [ ] Move events capture `fromListId` and `toListId`.
- [ ] Comment events capture `commentId`.
- [ ] Supported event types include: `card_created`, `card_moved`, `card_commented`, `card_updated`, `comment_edited`.
- [ ] Events are stored per board and ordered newest-first.
- [ ] Mock data includes at least one example of each event type.
- [ ] Helper creates deterministic ISO-8601 timestamps for mock data.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

- Events should still render when the related card is missing (show a safe fallback label).
- Keep the model extensible for future notifications and summaries.
