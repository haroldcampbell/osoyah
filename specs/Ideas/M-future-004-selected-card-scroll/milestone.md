# M-future-004-Selected Card Scroll Reliability

Conform to `docs/principles.md`.

## Summary
Define and validate a reliable strategy to keep selected cards visible after the card detail panel closes (bug fix).

## Goal
Ensure selected cards are always scrolled into view across route-based selection and click-based selection.

## Scope
In-scope:
- Scroll behavior with the card detail side panel open/closed.
- Route-based selection (deep link) and click-based selection.
- Horizontal board scrolling and list visibility.
Out-of-scope:
- New UI features beyond scroll reliability.
- Large refactors of board layout or drag-and-drop behavior.

## Specs
- [ ] S001-Selected card scroll reliability (bug)

## Notes
- Bug fix: scroll works on open/deep links but fails after panel close.
- Parked from S010 due to unresolved behavior.
