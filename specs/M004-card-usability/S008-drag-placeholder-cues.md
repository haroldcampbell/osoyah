# S008-Drag Placeholder Cues: Clear Drop Targets

Conform to `principles.md`.

## Summary
Improve drag-and-drop placeholder styling so the drop position is clearly visible while dragging cards.

## Goal
Make it obvious where a card will land by enhancing the placeholder's visual cues.

## Non-goals
- Changing drag-and-drop behavior or logic.
- Reordering or sizing rules beyond placeholder styling.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Placeholder styling should include:
  - A muted/grey tint distinct from normal cards.
  - Slight indentation or offset to highlight placement.
  - Reduced height relative to a normal card.
- Ensure placeholder remains visible on narrow viewports.
- Avoid introducing layout jitter when dragging within a list.
