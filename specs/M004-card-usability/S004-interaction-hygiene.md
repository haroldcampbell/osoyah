# S004-Interaction Hygiene: Menus, Focus, and Tokens

Conform to `docs/principles.md`.

## Summary
Keep secondary interactions low-noise and consistent by defining menu dismissal behavior, focus outlines, and shared button styling tokens.

## Goal
Reduce visual clutter and prevent interaction glitches while keeping controls discoverable.

## Non-goals
- New UI features beyond existing menus and buttons.
- Theming or full visual redesigns.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run e2e` passes.

## Definition of Done
- List menus close on outside click or Escape.
- Menu controls are low-noise (dimmed or hidden until hover/focus).
- Button labels do not wrap and use the shared radius token.

## Notes (edge cases, hazards, perf constraints)
- List context menus should dismiss when clicking outside of them or pressing Escape.
- List action controls should be dimmed or hidden until hover/focus.
- List action menus should not show focus outlines when dismissed.
- Button labels should not wrap by default.
- Button corner radius should match card radius via shared tokens.
