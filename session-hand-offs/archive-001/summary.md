# archive-001 summary

Date range: 2025-12-21-01 to 2026-01-01-07

## Executive summary
This archive covers the initial foundation and core product build-out: repo scaffold, Angular frontend setup, core Kanban CRUD + drag-and-drop, expanded card usability (panel, markdown, comments), and the shift to multi-board cards with membership/navigation, board management, and routing. It also captures UI polish and styling conventions, plus early exploration of SCSS nesting and scroll behavior. Key decisions solidified the tech stack (FastAPI + Angular), file-based mock data, Playwright E2E, and global card identity with board-scoped ordering. [2025-12-21-01, 2025-12-21-02, 2025-12-21-03, 2025-12-27-03]

## Highlights by theme
- Foundation + tooling: Repo scaffold, spec templates, principles/process docs, lint/format/test harnesses, and Playwright setup with sandbox workarounds. [2025-12-21-01, 2025-12-21-02, 2025-12-21-03, 2025-12-22-01]
- Core Kanban: Board/list/card CRUD, drag-and-drop, and test scaffolding. [2025-12-21-03]
- Card usability (M004): Card detail panel, inline editing, interaction hygiene, markdown rendering + safety, and UI polish; E2E suite split into spec-aligned files. [2025-12-23-02, 2025-12-24-02, 2025-12-25-02, 2025-12-25-03]
- Multi-board cards (M005): Shift to global cards with per-board list membership, attach flows, membership navigation, board selector + CRUD, and board management panel. [2025-12-27-03, 2025-12-27-04, 2025-12-28-01, 2025-12-28-02, 2025-12-28-03]
- Routing + validation + layout: Deep-link routing for boards/cards, title validation via modal, board layout polish, and board gallery home with activity tracking/sorting. [2025-12-30-01, 2025-12-30-02, 2026-01-01-01, 2026-01-01-02]
- UI system/scroll exploration: SCSS nesting conventions, native list scrollbar adoption, and related scroll behavior changes. [2026-01-01-03, 2026-01-01-04, 2026-01-01-05, 2026-01-01-06]
- Relationships: Added card parent/child relationships as a separate collection, with seeded data. [2026-01-01-07]

## Key decisions (with provenance)
- Tech stack: FastAPI backend + Angular frontend. [2025-12-21-01]
- Data source: file-based mock data in `client/public/assets/data.json` via `HttpClient`. [2025-12-21-02]
- Drag-and-drop: Angular CDK drag-and-drop; global drag preview/placeholder styles for reliability. [2025-12-21-03, 2025-12-27-01]
- Testing: Playwright for E2E; prefer stable data attributes; logs under `client/logs/`. [2025-12-21-03, 2025-12-22-02]
- Card model: Cards are global entities, lists store `cardIds`, cards can appear on multiple boards. [2025-12-27-03]
- Markdown: `marked` + `DOMPurify`, global styles for rendered HTML. [2025-12-25-02, 2025-12-25-03]
- Scroll surface: Use `.lists` as the horizontal scroll container; remove detached scrollbar. [2026-01-01-04]

## Compacted summary of major work completed
- Repo scaffold, docs, and templates created; session hand-off tracking added. [2025-12-21-01]
- Angular workspace bootstrapped with lint/format, Material baseline, and mock data service. [2025-12-21-02]
- Core Kanban UI + CRUD + drag-and-drop implemented, with unit tests and initial E2E scaffolding. [2025-12-21-03]
- Multiple rounds of UI and interaction polish for card panel, inline editing, markdown rendering, and list layouts; E2E specs aligned to specs and stabilized. [2025-12-23-02, 2025-12-24-02, 2025-12-25-02, 2025-12-25-03]
- Multi-board card model and attach flows implemented; board selector, management panel, and membership navigation added. [2025-12-27-03, 2025-12-27-04, 2025-12-28-01, 2025-12-28-02, 2025-12-28-03]
- Deep-link routing and title validation introduced; board gallery home and layout polish delivered. [2025-12-30-01, 2025-12-30-02, 2026-01-01-01, 2026-01-01-02]
- SCSS nesting conventions drafted and applied to board styles; scroll approach shifted to native list scrolling. [2026-01-01-03, 2026-01-01-04, 2026-01-01-05]
- Card parent/child relationship model added with created timestamps. [2026-01-01-07]

## Learnings + patterns captured
- Global styles required for CDK drag preview/placeholder and markdown output rendered via `innerHTML`. [2025-12-27-01, 2025-12-25-03]
- E2E stability improves with mouse-driven drags, stable `data-*` selectors, and storing Playwright outputs under `client/logs/`. [2025-12-22-02]
- Sandbox constraints can block Playwright installs and dev server binding; external runs may be required. [2025-12-22-01]

## Outstanding items and open questions (at archive close)
- Playwright browser install + E2E web server port issues noted in sandbox; ensure external install or port override if needed. [2025-12-22-01]
- Remaining M004 specs beyond S005–S013 were still pending at time of the M004 hand-offs. [2025-12-23-02, 2025-12-24-01]
- Markdown attachments (S006-02) and panel save notification (S006-03) not started. [2025-12-25-02, 2025-12-25-03]
- Confirm placeholder tint/offset values for drag placeholders. [2025-12-27-01]
- Roll-up experiment variants and hierarchy UI details were flagged for future confirmation. [2025-12-27-02]
- Spec scope questions for list validation/scroll and side-panel accessibility remained open after SCSS exploration. [2026-01-01-03]
- Selected-card post-close scroll visibility remained unresolved and was moved to an Ideas bug spec. [2026-01-01-06]

## Notes on provenance
Citations in brackets refer to archive hand-off IDs (e.g., `[2026-01-01-06]`) for traceability.
