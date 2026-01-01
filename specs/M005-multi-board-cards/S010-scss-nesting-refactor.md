# S010-SCSS Nesting Refactor: Exploration

Conform to `docs/principles.md`.

## Summary

Assess how to refactor existing SCSS to use native nesting and propose a safe, incremental approach for M005.

## Goal

Define a clear plan for introducing SCSS nesting with minimal risk to existing styles and diffs.

## Non-goals

-   Large-scale visual redesigns.
-   Renaming CSS classes or changing component structure.
-   Introducing new styling libraries or preprocessors.

## Definition of Done

-   [ ] Identify the SCSS files in M005 scope that would benefit most from nesting (top 3-5).
-   [ ] Propose nesting conventions (depth limits, selector ordering, and where to avoid nesting).
-   [ ] Outline a staged migration plan (pilot file, verification steps, rollback strategy).
-   [ ] Call out any tooling or lint considerations for nested SCSS.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)

-   Prefer low-risk components first (smallest selectors, limited overrides).
-   Avoid nesting that increases specificity unexpectedly.
