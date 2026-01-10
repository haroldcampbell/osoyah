# S003-05-BoardService Panel State: Centralize Board Panel State

Conform to `docs/principles.md`.

## Summary

Review IOs for the board surface components and refactor panel state/actions into smaller, domain-specific services (or `BoardService` when appropriate) so components rely on service-driven state instead of large input/output chains, informed by the IO needs discovered in S003-03/S003-04.

## Goal

Reduce component input/output wiring by moving board panel sort state and related actions into a domain-specific service (or `BoardService` when appropriate), keeping behavior unchanged.

Scope of IO review (components)

-   `board-hierarchy-drawer`
-   `board-hierarchy-metrics`
-   `board-hierarchy-panel`
-   `board-panel`
-   `board-toolbar`
-   `card`
-   `card-panel`
-   `list`

## IO review (current -> proposed)

-   `board-hierarchy-drawer`
    -   Current IOs: `state`, `treeTemplate`, `action`
    -   Proposed: move panel state/actions into `HierarchyPanelStateService` and keep only `treeTemplate` input.
-   `board-hierarchy-metrics`
    -   Current IOs: `boardId`
    -   Proposed: derive board id via `HierarchyPanelStateService` (no input).
-   `board-hierarchy-panel`
    -   Current IOs: `state`, `treeTemplate`, `action`
    -   Proposed: move panel state/actions into `HierarchyPanelStateService` and keep only `treeTemplate` input.
-   `board-panel`
    -   Current IOs: `activeBoardId`, `currentBoardId`, `archivedView`, `sortMode`, `archivedBoards`, `pinnedBoards`, `visibleBoards`, plus action outputs
    -   Proposed: move panel state/actions into `BoardPanelStateService` (or `BoardService` if needed) and bind directly in the component to remove IO wiring.
-   `board-toolbar`
    -   Current IOs: `activeBoardId`, `activeCardId`, `boardNotFound`, `viewMode`, `boardTitle`, `boardLists`, `boardCreatedAt`, plus action outputs
    -   Proposed: derive board metadata (title/lists/createdAt) from `BoardService`; keep view mode change output (for now) to preserve board list reset behavior; consider a `BoardViewStateService` if view mode/selection needs to be shared.
-   `card`
    -   Current IOs: `card`, `list`
    -   Proposed: keep; already minimal and domain-specific.
-   `card-panel`
    -   Current IOs: `selectedCard`, `selectedList`, `boardLists`, `activeBoardId`, `activeCardId`
    -   Proposed: keep for now; consider a `CardPanelStateService` if selection/state becomes shared across multiple views.
-   `list`
    -   Current IOs: `list`
    -   Proposed: keep; already minimal and domain-specific.

## Non-goals

-   New features or behaviors.
-   Visual redesigns or layout changes beyond what is required for refactoring.
-   Refactoring routing or data models beyond the board panel state needs.

## Definition of Done

-   [x] IO review completed for the listed components with a short mapping of current IOs and proposed service ownership.
-   [x] Board panel sort mode state lives in a domain-specific service (or `BoardService`) and is the single source of truth.
-   [x] Board panel actions (pin/unpin/archive/restore) update sort mode and order consistently via the service.
-   [x] Board panel and other board sibling components use service state instead of large input/output chains where applicable, based on S003-01/02/03/04 IOs.
-   [x] Behavior remains identical for sorting, panel toggles, and board ordering.
-   [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run e2e` passes.
-   `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

-   Follow the "Component refactor checklist" in `docs/learning.md`.
-   Keep service updates explicit and avoid hidden side effects.
-   Prefer smaller, domain-specific services over expanding `BoardService` when extracting shared state/actions.
-   Explore candidates such as `BoardPanelStateService`, `BoardViewStateService`, and `BoardSettingsService` based on the IO review.
