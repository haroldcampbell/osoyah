# S001-Decision Timeline: Rationale Capture

Conform to `docs/principles.md`.

## Summary
Attach short decision notes to cards and boards to preserve rationale (what we decided, why, and when).

## Goal
Users can capture and retrieve decision context in a predictable timeline UI.

## Non-goals
- Replacing docs/wiki systems.
- Long-form meeting notes.
- Real-time chat.

## Definition of Done
- [ ] Decisions require `title` and `rationale`.
- [ ] Decisions record `created_at`, `created_by`, and `scope` (card or board).
- [ ] Timeline view lists decisions in reverse chronological order.
- [ ] UI handles loading/empty/error states.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Timeline renders entries with title, rationale, and author.
  - Empty state shown when no decisions exist.
- `npm run e2e`
  - Creating a decision shows it immediately in the timeline.
  - Decisions are ordered newest-first.

## Notes (edge cases, hazards, perf constraints)
- If rich text is supported, document sanitization and limits.
- Paginate when timelines exceed 200 entries.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
