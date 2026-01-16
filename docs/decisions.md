# Decisions

Current active decisions, consolidated from session hand-offs. When a decision changes, replace it here with the new choice.

## Architecture

-   Backend: FastAPI (`backend/server/`).
-   Frontend: Angular (`client/`).

## Frontend data strategy

-   Use file-based mock data in `client/public/assets/data.json` accessed via `HttpClient`.
-   Keep data models minimal, extending with related collections and richer metadata only as needed.
-   Use Playwright for E2E tests.
-   Use Angular CDK drag-and-drop for list/card ordering.
-   Maintain board state in-memory on the client until backend persistence is added.
-   Markdown rendering uses `marked` + `DOMPurify`.
-   Editable inputs inside panels can use negative horizontal margins to align with panel edges; prefer symmetric offsets (e.g., `margin: 0 -0.5rem`) for clarity.

## Specs and documentation

-   Specs are named with `S00X-` prefixes and live alongside each milestone’s `milestone.md`.
-   Milestone docs live at `specs/M00X-*/milestone.md`.
-   Future/idea milestones live under `specs/Ideas/` to reduce noise in active milestone lists.
-   Templates use `_template_<purpose>.md` naming.
-   Specs should include a `Definition of Done` section; add one before implementation if missing.
-   Specs should avoid mixing concerns; if scope grows beyond a single cohesive behavior, split into a new spec.
-   Prefer free SVG icons from established libraries (Font Awesome) instead of hand-drawn SVG paths.
-   Commit messages include milestone + spec code as `(<milestone>-<spec>)` (e.g., `feat (M004-S006-02): drag placeholder cues`).
-   Model relationships as separate collections/tables (not embedded on the primary entities) to stay SQL-friendly and scalable.
-   New relationship records capture `createdAt` timestamps and default them via a service helper.
-   Comment sources are explicit (`user`, `system`, `bot`) to distinguish activity posts.
-   Relationship changes generate system comments on both parent and child cards.
-   Angular components that declare `imports` should include `standalone: true` in the `@Component` metadata.
-   Feature-specific UI types stay co-located with the feature; only shared domain models go in `models/`.
-   Backend tables include a `guid` column that is UUID4 compliant and unique (required in API payloads).
-   Relationship tables do not add standalone `guid` values unless relationships become first-class entities (metadata, audit, or comments).
-   Use separate SQLite databases per environment: `osoyah-dev.db`, `osoyah-test.db`, `osoyah-prod.db`. Tests must only write to `osoyah-test.db`.

## API documentation

-   `docs/api/openapi.json` is the canonical API contract and is refreshed via `python backend/scripts/export_openapi.py`.

## Tooling

-   Prefer Python scripts over bash/shell scripts for developer tooling.

## UX feedback

-   State changes should surface visual feedback; use self-dismissing toasts for both success and failure.

## Test guidance

-   E2E assertions should target specific entities using stable `data-*` attributes (`data-card-id`, `data-list-id`).
-   Favor state-change assertions (card present in target list and absent from source list) over label-only checks.
-   Avoid generic text matches; scope locators to the intended list/card element.
-   Use before/after assertions to confirm the state transition.
-   When possible, use helper selectors/utilities that encode test intent.

## Domain-driven design boundaries

-   Use domain-driven design boundaries and keep specs scoped to a single bounded context when possible.
-   Current bounded contexts:
    -   Board Management: lists, cards, ordering, selection.
    -   Card Content: descriptions, comments, markdown rendering, attachments.
    -   UI Shell: panel layout, notifications, layout chrome.
-   If a spec spans multiple contexts, split it or explicitly justify the cross-context scope in the spec notes.
