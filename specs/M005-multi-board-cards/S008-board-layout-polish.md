# S008-Board Layout Polish: Reduced Chrome + Spacing

Conform to `docs/principles.md`.

## Summary

Reduce visual chrome by removing the board background card and tightening layout spacing.

## Goal

Make the board layout feel lighter and less boxed-in.

## Non-goals

-   New navigation features or panel behaviors.
-   Typography overhaul or global theme changes.
-   Mobile-specific layout work.

## Definition of Done

-   [x] Remove the board container background card styling.
-   [x] Reduce vertical spacing between the header and board content.
-   [x] Preserve readability and existing interaction affordances.
-   [x] Existing single-board flows continue to work.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   `npm run lint` passes.
-   `npm run format:check` passes.
-   `npm run e2e` passes.
