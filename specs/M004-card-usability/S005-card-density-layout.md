# S005-Card Density Layout: Metadata on Cards

Conform to `docs/principles.md`.

## Summary
Expose key metadata directly on the card surface (description preview, comment count, last activity time) to make cards more information-dense.

## Goal
Let users scan the board and understand card context at a glance.

## Non-goals
- Full visual redesign or theming overhaul.
- New icons beyond minimal indicators for metadata.

## Definition of Done
- [ ] Card surface renders title, description preview, and metadata row in that order.
- [ ] Description preview renders only when non-empty and truncates to 1–2 lines.
- [ ] Preview renders inline Markdown (bold, italic, links, inline code, unordered lists) and falls back to plain text on errors.
- [ ] Links are visually distinct and open in a new tab with safe rel attributes.
- [ ] Metadata row shows comment count and last activity as relative time.
- [ ] Last activity tooltip shows exact timestamps for created and last updated.
- [ ] Relative time updates at least once per minute while the board is open.
- [ ] Comment count matches the number of comment objects on the card.
- [ ] Metadata row remains readable at narrow widths.
- [ ] Side panel spans the window height, is wider than the previous default, and is not constrained by the board container.
- [ ] Side panel content scrolls internally so the page does not need to scroll to reach the comment composer.
- [ ] Panel changes auto-save without a "Save changes" button and move "Delete card" into a menu action.
- [ ] Opening a card panel scrolls the selected card into view if it is obscured.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Do not show an explicit "Metadata" label; use compact icon/text pairs or separators.
- Keep card height compact beyond the preview truncation.
- Prefer existing SCSS tokens or add minimal new tokens for spacing.
- When the panel is open, offset the board layout with a right margin based on the panel width to keep list spacing consistent.

### S002 Deviation: This spec adjusts side-panel behavior defined in S002
  - Comments list scrolls independently with the comment composer anchored so "Post Comment" stays visible.
  - Add Comment field stays single-line unless focused or contains text; expand to multi-line on focus/input.
  - "Delete card" lives in a panel menu; there is no "Save changes" button.
  - Side panel breaks out of its container to match the window height and is wider than the current default.
