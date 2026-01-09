# S002-Board View Modes (List): Account Boards

Conform to `docs/principles.md`.

## Summary
Introduce a list view mode for account-style boards with expandable rows and side-panel details.

## Goal
Support CRM-style account tracking while keeping card view available for pipeline boards.

## Non-goals
- Full-screen account detail view.
- Custom column configurations beyond a minimal set.

## Definition of Done
- [x] Boards can toggle between card and list view.
- [x] List view supports expandable rows.
- [x] Side panel shows account details from list view.
- [x] View mode is preserved per board in-memory.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Mockup: `designs/mockups/M009-S002-account-list-view.excalidraw`.
- View toggle placement: inside `.board-toolbar`, positioned to the left of `.add-list`. Wrap the toggle + add-list in a flex container with `gap: 10px`.
- Toggle labels: `Cards | List`. Default to Cards view when no in-memory preference exists.
- List view columns (left-to-right): `Title`, `Created`, `Completed`.
- Expandable rows: use a left-edge disclosure control; multiple rows can be expanded at once.
- Expanded content: show child card info sourced from relationships; include an empty state when no child cards exist.
- Side panel opens on title click (reuse existing card panel behavior).
