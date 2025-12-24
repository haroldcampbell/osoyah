# S005-Card Density Layout: Metadata on Cards

Conform to `principles.md`.

## Summary
Expose key metadata directly on the card surface (description preview, comment count, created date) to make cards more information-dense.

## Goal
Let users scan the board and understand card context at a glance.

## Non-goals
- Full visual redesign or theming overhaul.
- New icons beyond minimal indicators for metadata.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Card surface must include (in this order):
  1) Title
  2) Description preview (1–2 lines, truncated, Markdown rendered)
  3) Metadata row with created date (relative time) and comment count
- The description preview should be omitted if empty; metadata row should still render.
- When not in edit mode, the description preview renders Markdown (inline only: bold, italic, links, inline code, and unordered lists).
- Markdown preview should gracefully degrade to plain text if rendering fails.
- Links should be visually distinguished and open in a new tab with safe `rel` attributes.
- Comment count reflects the number of comment objects on the card.
- Show created date as relative time (e.g., "2d ago") with the exact date in a tooltip.
- Relative time should update live (at least once per minute) while the board is open.
- Keep card height compact; truncate long text.
- Prefer existing tokens or add minimal new tokens for spacing.
- Ensure metadata remains readable at narrow widths.
