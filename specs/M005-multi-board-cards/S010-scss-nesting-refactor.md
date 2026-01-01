# S010-SCSS Nesting Refactor: Exploration

Conform to `docs/principles.md`.

## Summary

Assess how to refactor existing SCSS to use native nesting and propose a safe, incremental approach for M005. Extend the exploration to ensure selected-card scrolling remains reliable with the custom board scrollbar.

## Goal

Define a clear plan for introducing SCSS nesting with minimal risk to existing styles and diffs. Validate a reliable scroll-into-view approach for selected cards that works with the detached board scrollbar.

## Non-goals

-   Large-scale visual redesigns.
-   Renaming CSS classes or changing component structure.
-   Introducing new styling libraries or preprocessors.

## Definition of Done

-   [x] Identify the SCSS files in M005 scope that would benefit most from nesting (top 3-5).
-   [x] Propose nesting conventions (depth limits, selector ordering, and where to avoid nesting).
-   [x] Outline a staged migration plan (pilot file, verification steps, rollback strategy).
-   [x] Call out any tooling or lint considerations for nested SCSS.
-   [x] Document the current selected-card scroll behavior and why it fails with the custom scrollbar.
-   [ ] Propose a reliable scroll-into-view strategy that accounts for the board scrollbar element (Won't do).
-   [ ] Define verification steps for route-based selection and click-based selection (Won't do).

## Proposed nesting conventions

-   Depth limit: 2 levels (rarely 3 for simple state groupings).
-   Order within a block: base selector → direct children → modifiers (`.current`, `.warning`, `.is-*`) → states (`:hover`, `:focus-visible`) → media overrides.
-   Prefer nesting for states and direct children only; keep cross-component selectors flat.
-   Use `&` only for related modifiers/states (`&.current`, `&:hover`); avoid `&` gymnastics for unrelated selectors.
-   Avoid descendant chains that increase specificity unexpectedly (no `.a { .b .c { ... } }`).

## Candidate files (M005 scope, top 3-5)

1. `client/src/app/board/board.component.scss` (pilot; largest surface area + most state selectors).
2. `client/src/app/board-gallery/board-gallery.component.scss` (simple block structure).
3. `client/src/app/board-header/board-header.component.scss` (shared header; consistent layout rules).
4. `client/src/app/board-list/board-list.component.scss` (list + drag/drop states).
5. `client/src/app/board-card/board-card.component.scss` (card hover/focus states).

## Staged migration plan

1. Pilot: refactor `board.component.scss` with shallow nesting only (states + direct children).
2. Verify: manual smoke pass (board load, open panel, hover/focus, mobile width); run `npm run lint` + `npm run format:check` and store logs in `client/logs/`.
3. Expand: apply the same conventions to one file at a time (smallest/lowest-risk first).
4. Rollback: keep changes per file small so reverting a single file restores behavior; avoid cross-file changes.

## Tooling/lint considerations

-   Sass nesting is supported by the Angular build pipeline (Dart Sass).
-   Current lint/format scripts should remain unchanged; verify formatting output stays stable.
-   If future linting is added (stylelint), enforce max nesting depth (2) and disallow complex selectors.

## Selected-card scrolling notes (exploration)

### Current behavior
- Selection changes trigger `scrollIntoView` based on `[data-testid="card"][data-card-id="..."]`.
- Board horizontal scrolling is synced to a detached `.board-scrollbar` element.

### Failure modes
- Scroll attempt can fire before card DOM is available (route load).
- Horizontal scroll sync can keep the lists container from moving as expected.

### Proposed approach (to validate)
- Remove the detached board scrollbar element and use the lists container (`.lists`) as the primary horizontal scroller.
- Ensure layout stretches so the lists scrollbar sits at the bottom of the viewport.
- When a card is selected, compute the card’s left/right position relative to the `.lists` container and update `scrollLeft` directly (no reliance on the detached track).
- Include a small, bounded retry (e.g., next animation frame + one timeout) if the card isn’t yet rendered.

### Verification
- Route load to a card: card is scrolled into view and remains accessible.
- Click a card in a far-right list: horizontal scroll brings it into view.

## Acceptance tests (exact commands + expected artifacts/output)

-   Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
-   `npm run lint` passes.
-   `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)

-   Prefer low-risk components first (smallest selectors, limited overrides).
-   Avoid nesting that increases specificity unexpectedly.
