# M006-Card Relationships: Parent/Child Links

Conform to `docs/principles.md`.

## Summary
Introduce parent/child links for cards, allowing a child to reference a parent card on another board with a single-parent rule.

## Goal
Support hierarchical card relationships without changing board/list structures.

## Scope
In-scope:
- Parent/child links with one parent per card.
- Cross-board parent/child relationships.
- Side-panel UX for linking and browsing.
Out-of-scope:
- Relationship roll-ups (handled in M008).
- New hierarchy entities beyond cards.

## Specs
- [ ] S001-Parent/Child Links (Single Parent)
- [ ] S002-Relationship Integrity
- [ ] S003-Parent/Child UX

## Notes
- Parent/child visibility lives in the side panel only.
