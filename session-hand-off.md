# Session Hand-Off

## How to Use

-   Add entries in `session-hand-offs/` named `yyyy-mm-dd-title.md`.
    -   Summarize key decisions, progress, and next steps.
-   Session hand-off filenames should not include milestone IDs (e.g., avoid `M00X` in filenames).
-   Update `docs/decisions.md` to reflect active decisions (replace or remove superseded ones).
-   Add `yyyy-mm-dd-nn-title.md` to this file (use `nn` to preserve order for multiple entries in a day).
    -   Entries are added in reverse chronological order (Oldest at the bottom)
-   Use `session-hand-offs/_template.md` for individual hand-offs and `session-hand-offs/_summary-template.md` for archive summaries.

## Primary Directives

-   Review and follow the AGENTS.md
-   Read the last session hand-off.
-   Before answering status or decision questions, read the latest entry in `session-hand-offs/` and `docs/decisions.md`.
-   Read archive summaries in `session-hand-offs/archive-00x/summary.md` when you need older context.
-   After drafting a hand-off, review potential learnings and ask the user which items to save in `docs/learning.md`. If confirmed, append a dated entry.
-   Ensure new session hand-off filenames do not include milestone IDs (e.g., avoid `M00X`).
-   Strict naming rule: filenames must be `yyyy-mm-dd-nn-title.md` and must not include spec or milestone identifiers (e.g., `S00X`, `M00X`, `s002`, `m005`). If present, rename before proceeding.

## Templates

-   `session-hand-offs/_template.md` is for single-session hand-off entries (one file per session).
-   `session-hand-offs/_summary-template.md` is for archive summaries that consolidate multiple hand-offs into an executive summary with citations.

## Entries

-   2026-01-09-05-component-extraction-wrap.md - S003-01/03/04/05 extraction wrap + panel state services
-   2026-01-09-04-board-views-refactor.md - Extracted list/cards views into components, drafted S003 sub-specs
-   2026-01-09-03-milestone-renumber.md - Remove obsolete done-lists milestone and renumber M010/M011
-   2026-01-09-02-list-view-grid.md - List view grid layout, toggle, and E2E coverage
-   2026-01-09-01-done-list-config-toast.md - Done list configuration, settings toast, UX patterns added
-   2026-01-07-01-default-panel-states-wrap.md - Default panel states done, E2E updated, docs clarified
-   2026-01-06-02-rollup-metrics.md - M008 S001 roll-up metrics complete, S003 spec drafted
-   2026-01-06-01-hierarchy-management-wrap.md - M007 S003 hierarchy management, reorder workaround, future spec drafted
-   2026-01-05-06-m007-s001-s002.md - M007 S001/S002 hierarchy model + UI
-   2026-01-05-05-e2e-assertion-hardening.md - S009 E2E assertion hardening
-   2026-01-05-04-card-move-comments.md - S008 card move system comments + list-move comment tests
-   2026-01-05-03-card-panel-component.md - S006 card panel component extraction
-   2026-01-05-02-parent-selector-search.md - S005 parent selector dropdown search + debounce, E2E adjustment
-   2026-01-05-01-list-picker-wrap.md - S007 list picker wrap, E2E stabilization, new S008 spec draft
-   2026-01-04-01-card-completion-progress.md - S004 completion status, progress indicators, done-list sync, new done-list spec (now M009) and S007 specs
-   2026-01-03-01-card-relationships-ux.md - M006 S002/S003 relationship integrity + side-panel UX, modal unlink, system comments, new S004/S005 specs

### Archives

-   archive-001 (2025-12-21-01 - 2026-01-01-07)
