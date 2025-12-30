# S003-Card Due Dates: Time Boundaries

Conform to `docs/principles.md`.

## Summary
Add a due date field to cards so risk and capacity features can use explicit time signals.

## Goal
Users can set and edit a due date per card with clear validation and display rules.

## Non-goals
- Full calendar views.
- Recurring schedules.
- Time tracking.

## Definition of Done
- [ ] Card model includes `due_at` (nullable ISO-8601 string).
- [ ] Card detail UI supports setting and clearing due dates.
- [ ] Overdue cards show a visual indicator.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Due date field renders with validation feedback.
  - Overdue indicator appears when date is in the past.
- `npm run e2e`
  - Setting a due date persists and displays in the card detail.

## Notes (edge cases, hazards, perf constraints)
- Use workspace locale for date display, but store ISO-8601.
- Overdue should be based on local midnight, not time-of-day precision.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
