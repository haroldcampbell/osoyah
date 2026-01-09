# S001-Standalone Components: Align Imports + Decorators

Conform to `docs/principles.md`.

## Summary

Update Angular components that declare `imports` to explicitly set `standalone: true`, matching Angular conventions and eliminating editor warnings.

## Goal

Make component metadata consistent and reduce tooling noise without changing runtime behavior.

## Non-goals

-   Feature changes or UI redesigns.
-   Refactoring component templates or styling.
-   Converting NgModules or altering routing structure.

## Definition of Done

-   [x] All components using `imports` set `standalone: true`.
-   [x] No component without `imports` is modified solely for this change.
-   [x] Build/test warnings for missing `standalone` are resolved.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)

-   Use minimal, mechanical edits to avoid unrelated diffs.
