# S003-05-BoardService Panel State: Centralize Board Panel State

Conform to `docs/principles.md`.

## Summary

Refactor board panel state and actions into `BoardService` so board view/panel components can rely on service-driven state instead of large input/output chains, informed by the IO needs discovered in S003-03/S003-04.

## Goal

Reduce component input/output wiring by moving board panel sort state and related actions into `BoardService`, keeping behavior unchanged.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for refactoring.
-   Refactoring routing or data models beyond the board panel state needs.

## Definition of Done

-   [ ] Board panel sort mode state lives in `BoardService` and is the single source of truth.
-   [ ] Board panel actions (pin/unpin/archive/restore) update sort mode and order consistently via the service.
-   [ ] Board panel and other board sibling components use `BoardService` state instead of large input/output chains where applicable, based on S003-03/S003-04 IOs.
-   [ ] Behavior remains identical for sorting, panel toggles, and board ordering.
-   [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   Follow the "Component refactor checklist" in `docs/learning.md`.
-   Keep service updates explicit and avoid hidden side effects.
-   Explore if `BoardService` should be split after assessing S003-03/S003-04 IO needs; note candidates such as `BoardPanelStateService`, `BoardViewStateService`, and `BoardSettingsService`.
