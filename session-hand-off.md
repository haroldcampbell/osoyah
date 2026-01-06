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
-   After drafting a hand-off, review potential learnings and ask the user which items to save in `docs/learning.md`. If confirmed, append a dated entry.
-   Ensure new session hand-off filenames do not include milestone IDs (e.g., avoid `M00X`).
-   Strict naming rule: filenames must be `yyyy-mm-dd-nn-title.md` and must not include spec or milestone identifiers (e.g., `S00X`, `M00X`, `s002`, `m005`). If present, rename before proceeding.

## Entries

-   2026-01-05-06-m007-s001-s002.md - M007 S001/S002 hierarchy model + UI
-   2026-01-05-05-e2e-assertion-hardening.md - S009 E2E assertion hardening
-   2026-01-05-04-card-move-comments.md - S008 card move system comments + list-move comment tests
-   2026-01-05-03-card-panel-component.md - S006 card panel component extraction
-   2026-01-05-02-parent-selector-search.md - S005 parent selector dropdown search + debounce, E2E adjustment
-   2026-01-05-01-list-picker-wrap.md - S007 list picker wrap, E2E stabilization, new S008 spec draft
-   2026-01-04-01-card-completion-progress.md - S004 completion status, progress indicators, done-list sync, new M010 and S007 specs
-   2026-01-03-01-card-relationships-ux.md - M006 S002/S003 relationship integrity + side-panel UX, modal unlink, system comments, new S004/S005 specs
-   2026-01-01-07-parent-child-relationships.md - S001 parent/child relationship model + mock data + tests
-   2026-01-01-06-session-wrap.md - S010 wrap + native scroll shift + Ideas bug spec
-   2026-01-01-05-scss-scroll-wrap.md - S010 DoD wrap-up, scroll work parked
-   2026-01-01-04-native-scrollbar-card-scroll.md - Native lists scrollbar + selected card scroll fix
-   2026-01-01-03-scss-nesting-exploration.md - SCSS nesting conventions + board styles pilot refactor
-   2026-01-01-02-board-gallery-home.md - S009 board gallery home + shared header + board settings description + future specs
-   2026-01-01-01-board-layout-polish.md - S008 layout polish + fixed scrollbar + spacing/contrast updates
-   2025-12-30-02-title-validation-ui.md - S007 validation + card edit modal + learnings capture
-   2025-12-30-01-board-routing.md - Board routing + deep links implementation
-   2025-12-29-01-product-differentiation-specs.md - Differentiation notes + idea specs + dependencies
-   2025-12-28-03-board-management-panel.md - S005 board management panel, sorting, pinned/archived, compact layout
-   2025-12-28-02-board-selector-crud.md - S004 board selector + CRUD, settings panel, S006/S007 spec drafts
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
