# S006-02-Drag Placeholder Cues: Clear Drop Targets

Conform to `docs/principles.md`.

## Summary

Improve drag-and-drop placeholder styling so the drop position is clearly visible while dragging cards.

## Goal

Make it obvious where a card will land by enhancing the placeholder's visual cues.

## Non-goals

-   Changing drag-and-drop behavior or logic.
-   Reordering or sizing rules beyond placeholder styling.

## Definition of Done

-   [x] Drag placeholder uses a muted/grey tint distinct from normal cards.
-   [x] Placeholder includes a slight indentation or offset.
-   [x] Placeholder height is reduced relative to a normal card.
-   [x] Dragging within a list does not introduce layout jitter.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run format:check` passes.
-   `npm run e2e` passes.
