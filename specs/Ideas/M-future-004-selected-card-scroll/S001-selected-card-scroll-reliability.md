# S001-Selected Card Scroll Reliability (Bug)

Conform to `docs/principles.md`.

## Summary
Fix selected-card scrolling so the active card remains visible after the card detail side panel closes. Opening the panel already scrolls correctly.

## Goal
Guarantee selected cards are scrolled into view and not hidden after the panel closes, while preserving the existing open-panel and route deep link behavior.

## Non-goals

-   Redesign the board layout or panel UI.
-   Change drag-and-drop behaviors or list/card data models.

## Definition of Done

-   [ ] Closing the card panel keeps the selected card visible.
-   [ ] Existing behavior remains: route deep links scroll into view.
-   [ ] Existing behavior remains: clicking a card scrolls into view when opening the panel.
-   [ ] Scroll logic remains on a single horizontal scroll surface (`.lists`).
-   [ ] Behavior validated with the panel closing on wide boards.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)

-   The failure occurs after closing the panel; opening and deep links already work.
-   Ensure scroll calculations account for the panel width change on close.
-   Avoid infinite retries; use bounded, deterministic attempts.
