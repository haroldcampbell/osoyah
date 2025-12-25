# S002-Drag and Drop: Lists and cards

Conform to `docs/principles.md`.

## Summary

Add drag-and-drop interactions to reorder lists and move cards within or across lists.

## Goal

Enable basic Kanban flow by letting users rearrange lists and cards with drag-and-drop.

## Non-goals

- Persisting order changes to a backend.
- Touch gesture optimization beyond default CDK behavior.
- Multi-select or bulk moves.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` succeeds with no lint errors.
- `npm run start` launches the app and:
  - lists can be reordered left/right via drag-and-drop.
  - cards can be reordered within a list via drag-and-drop.
  - cards can be moved between lists via drag-and-drop.
- `npm run test` passes with unit tests covering drag-and-drop ordering updates.

## Notes (edge cases, hazards, perf constraints)

- Use Angular CDK drag-and-drop components.
- Maintain stable ordering in local state after a move.
