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
-   Strict naming rule: filenames must be `yyyy-mm-dd-nn-title.md` and must not include spec or milestone identifiers (e.g., `S00X`, `M00X`, `s002`, `m005`). If present, rename before proceeding.

## Entries

-   2025-12-28-01-membership-navigation.md - S003 membership indicators + navigation UI/E2E
-   2025-12-27-04-attach-flow.md - S002 attach flow + E2E updates, modal experiment note
-   2025-12-27-03-multi-board-card-model.md - S001 global card identity + memberships data model update
-   2025-12-27-02-milestone-planning-mockups.md - M005–M009 specs + Excalidraw mockups
-   2025-12-27-01-drag-placeholder-cues.md - Global CDK drag placeholder/preview styling
-   2025-12-25-03-s006-01-polish.md - S006-01 polish, panel/layout updates, global markdown styles
-   2025-12-25-02-markdown-rendering.md - S006-01 markdown rendering implementation + E2E coverage
-   2025-12-25-01-process-principles-move.md - Move principles into docs and slim process guide
-   2025-12-24-02-s005-panel-polish.md - S005 card density + side-panel polish, mock data, E2E updates
-   2025-12-24-01-dod-refinement.md - Refined M004 S005–S013 DoD checklists
-   2025-12-22-02-e2e-dragto-fix.md - E2E drag-and-drop locator fix
-   2025-12-22-01-m002-outstanding.md - M002 lint fix, Playwright install timeout, E2E EPERM
-   2025-12-21-03-basic-kanban.md - M002 UI, drag/drop, unit tests, Playwright setup
-   2025-12-21-02-frontend-setup.md - M001 implementation, tooling, Material, mock API
-   2025-12-21-01-repo-scaffold.md - repo setup, templates, principles, hand-off system, git init
-   ...
