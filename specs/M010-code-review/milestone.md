# M010-Code Review: Hygiene + Consistency

Conform to `docs/principles.md`.

## Summary

Address targeted code hygiene tasks that reduce tooling noise and improve consistency without changing behavior.

## Goal

Align metadata and conventions across components to keep the codebase consistent and reduce editor warnings.

## Scope

In-scope:

-   Standalone component metadata alignment for components using `imports`.
    Out-of-scope:
-   Feature changes or UI redesigns.
-   Refactoring NgModules or routing.

## Specs

-   [x] S001-Standalone Components
-   [ ] S002-UX patterns
-   [x] S003-00-UI component extraction
-   [ ] S003-01-Board Toolbar
-   [ ] S003-02-Board Panel
-   [ ] S003-03-Hierarchy Panel
-   [ ] S003-04-Hierarchy Panel Drawer

## Notes

-   Keep edits mechanical and minimal to avoid unrelated diffs.
