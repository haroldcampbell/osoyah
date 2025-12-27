# S003-Parent/Child UX: Side Panel Linking

Conform to `docs/principles.md`.

## Summary
Add side-panel controls to link a parent, browse children, and navigate across boards.

## Goal
Make parent/child relationships discoverable and editable from the card detail panel.

## Non-goals
- Card tile indicators.
- Full-screen detail view.

## Definition of Done
- [ ] Side panel includes a parent selector and children list.
- [ ] Users can navigate to related cards from the side panel.
- [ ] Cross-board parents and children are clearly labeled.
- [ ] Side panel remains usable on narrow viewports.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Mockup: `designs/mockups/M006-S003-card-parent-child-panel.svg`.
