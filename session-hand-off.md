# Session Hand-Off

## How to Use

-   Add entries in `session-hand-offs/` named `yyyy-mm-dd-title.md`.
    -   Summarize key decisions, progress, and next steps.
-   Session hand-off filenames should not include milestone IDs (e.g., avoid `M00X` in filenames).
-   Update `docs/decisions.md` to reflect active decisions (replace or remove superseded ones).
-   Add `yyyy-mm-dd-nn-title.md` to this file (use `nn` to preserve order for multiple entries in a day).
    -   Entries are added in reverse chronological order (Oldest at the bottom)

## Primary Directives

-   Review and follow the AGENTS.md
-   Read the last session hand-off.
-   Before answering status or decision questions, read the latest entry in `session-hand-offs/` and `docs/decisions.md`.
-   Ensure new session hand-off filenames do not include milestone IDs (e.g., avoid `M00X`).

## Entries

-   2025-12-22-02-e2e-dragto-fix.md - E2E drag-and-drop locator fix
-   2025-12-22-01-m002-outstanding.md - M002 lint fix, Playwright install timeout, E2E EPERM
-   2025-12-21-03-basic-kanban.md - M002 UI, drag/drop, unit tests, Playwright setup
-   2025-12-21-02-frontend-setup.md - M001 implementation, tooling, Material, mock API
-   2025-12-21-01-repo-scaffold.md - repo setup, templates, principles, hand-off system, git init
-   ...
