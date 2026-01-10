# 2026-01-09-05-component-extraction-wrap

## Summary
-   Completed S003-01/03/04/05 with component extractions and service-driven state to reduce IO wiring.
-   Added domain-specific panel state services to keep BoardService from growing.
-   Milestone context: M010 code review hygiene and UI component extraction.

## Work Completed
-   Extracted board toolbar, inline hierarchy panel, and hierarchy drawer into dedicated components, following the component refactor checklist in `docs/learning.md`.
-   Created `BoardPanelStateService` and `HierarchyPanelStateService` to centralize panel state/actions and reduce IO wiring.
-   Reduced component IOs by binding to service state for board panel, hierarchy panel/drawer, and hierarchy metrics.
-   Verified acceptance tests (lint/e2e/test) passed; logs under `client/logs/`.

## Decisions
-   Prefer smaller, domain-specific services for shared UI state over expanding `BoardService`.
-   Hierarchy panel state/actions live in `HierarchyPanelStateService`; board panel state/actions live in `BoardPanelStateService`.

## Open Questions
-   Should the hierarchy tree template be extracted into its own component to remove the remaining `treeTemplate` input?
-   Is it time to split additional view/settings state into `BoardViewStateService` or `BoardSettingsService`?

## Outstanding (M010)
-   S002-UX-patterns (Spec: `specs/M010-code-review/S002-UX-patterns.md`).

## Next Steps
-   User plans to work on S003-02 next (not covered in this hand-off).
-   If scope grows, confirm whether to introduce `BoardViewStateService`/`BoardSettingsService` before refactoring.
