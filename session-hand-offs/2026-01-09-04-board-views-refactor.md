# 2026-01-09-04-board-views-refactor

## Summary

-   Extracted list view and cards view into dedicated board view components, preserving behavior.
-   Added S003 sub-specs for toolbar/panels extraction and updated M010 milestone checklist.
-   Milestone context: M010 code review hygiene and UI component extraction.

## Work Completed

-   Moved list view and cards view blocks into `BoardListViewComponent` and `BoardCardsViewComponent` under `client/src/app/board/board-view/`.
-   Shifted list/cards view styles into component SCSS and stabilized horizontal scroll + card panel scroll-into-view.
-   Marked S003-00 DoD complete after lint/e2e/test passed and updated milestone status.
-   Drafted specs: S003-01 Board Toolbar, S003-02 Board Panel, S003-03 Hierarchy Panel, S003-04 Hierarchy Panel Drawer.

## Decisions

-   Treat hierarchy panel extraction as two variants: inline panel vs drawer variant.

## Open Questions

-   Confirm if the hierarchy panel split (inline vs drawer) matches intent for S003-03/S003-04.

## Outstanding (M010)

-   S002 UX patterns remains pending. (Spec: `specs/M010-code-review/S002-UX-patterns.md`)
-   S003-01 Board Toolbar pending. (Spec: `specs/M010-code-review/S003-01-Board-Toolbar.md`)
-   S003-02 Board Panel pending. (Spec: `specs/M010-code-review/S003-02-Board-Panel.md`)
-   S003-03 Hierarchy Panel pending. (Spec: `specs/M010-code-review/S003-03-Hierarchy-Panel.md`)
-   S003-04 Hierarchy Panel Drawer pending. (Spec: `specs/M010-code-review/S003-04-Hierarchy-Panel-Drawer.md`)

## Next Steps

-   Commit with message: "feat (M010-S003): Refactor card view and list view into components".
-   Pick next spec (likely S002 or S003-01) and review before implementation.
