# S001-Hierarchy Management Revisit: Tree Reorder UX

Conform to `docs/principles.md`.

## Summary

Rework hierarchy reordering so users can drag and drop boards directly in the tree with reliable drops and clear visual feedback.

## Why

The current approach relies on a separate reorder list because nested drag-and-drop in the tree was unreliable. A direct tree interaction is the desired UX and should be revisited once the drag/drop structure can be made stable.

## Goal

Enable direct tree reordering (siblings only) with consistent drop behavior and clear placeholders.

## Non-goals

-   Cross-tree reparenting by drag.
-   Bulk moves or multi-select.
-   Backend persistence changes.

## Definition of Done

To be determined during spec review

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run format:check` passes.
-   `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

-   Avoid nested drop lists that prevent drops from registering.
-   Ensure drag handles are unambiguous even with deep nesting.
