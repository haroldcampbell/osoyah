# S003-Board View Modes (List): Account Boards

Conform to `docs/principles.md`.

## Summary
Introduce a list view mode for account-style boards with expandable rows and side-panel details.

## Goal
Support CRM-style account tracking while keeping card view available for pipeline boards.

## Non-goals
- Full-screen account detail view.
- Custom column configurations beyond a minimal set.

## Definition of Done
- [ ] Boards can toggle between card and list view.
- [ ] List view supports expandable rows.
- [ ] Side panel shows account details from list view.
- [ ] View mode is preserved per board in-memory.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Mockup: `designs/mockups/M009-S003-account-list-view.svg`.
