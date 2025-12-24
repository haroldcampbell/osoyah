# S005-Card Density Layout: Metadata on Cards

Conform to `principles.md`.

## Summary
Expose key metadata directly on the card surface (description preview, comment count, created date) to make cards more information-dense.

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
- [ ] Metadata row shows created date as relative time with an exact-date tooltip.
- [ ] Relative time updates at least once per minute while the board is open.
- [ ] Comment count matches the number of comment objects on the card.
- [ ] Metadata row remains readable at narrow widths.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Keep card height compact beyond the preview truncation.
- Prefer existing tokens or add minimal new tokens for spacing.
