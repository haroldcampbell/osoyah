# S008-Board Layout Polish: Reduced Chrome + Spacing

Conform to `docs/principles.md`.

## Summary

Reduce visual chrome by removing the board background card and tightening layout spacing to accommodate the right-side panel.

## Goal

Make the board layout feel lighter and less boxed-in when the management panel is present.

## Non-goals

- New navigation features or panel behaviors.
- Typography overhaul or global theme changes.
- Mobile-specific layout work.

## Definition of Done

- [ ] Remove the board container background card styling.
- [ ] Reduce vertical spacing between the header and board content.
- [ ] Preserve readability and existing interaction affordances.
- [ ] Existing single-board flows continue to work.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Coordinate spacing changes with the right-side panel to avoid visual crowding.
