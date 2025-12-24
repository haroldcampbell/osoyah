# 2025-12-23-02-panel-inline-e2e

## Summary
- Implemented M004 S001–S004 (Card metadata, Card Detail Panel, Inline Title Editing, Interaction Hygiene).
- Rebalanced and renumbered M004 specs; added Definition of Done sections and milestone checkboxes.
- Split E2E suite into spec-aligned files and added spec tags in test titles.
- Polished UI behavior (inline edit stability, menu dismissal, button tokens, overflow fixes).

## Work Completed
- Card model now includes `createdAt`, `updatedAt`, `comments` and mock data updated.
- BoardService updated to manage card panel state, inline edits, comment add/remove, and panel delete.
- Card detail side panel (fixed order) with auto-save title, Save for other fields, delete card, comments CRUD.
- Inline title editing for cards and lists: click-to-edit, focus+select, blur exits, Escape cancels, layout stable.
- List context menu: single Remove action, dimmed icon, dismiss on outside click/Escape, no focus outlines.
- Active card highlight when panel open.
- Button radius and non-wrapping labels centralized via tokens; card/list radius tokenized.
- List width fixed to 280px; add-card input/button layout constrained to prevent overflow.

## Specs/Docs Updates
- Specs renumbered: S004 = Interaction Hygiene; later specs shifted + headers updated.
- Added DoD sections to S002/S003/S004.
- `specs/M004-card-usability/milestone.md` now uses [x]/[ ] checkboxes:
  - [x] S001, S002, S003, S004
  - [ ] S005–S013
- `specs/_template_milestone.md` updated to include checkbox format.

## E2E Suite
Split into focused files with spec tags:
- `client/e2e/list-management.spec.ts` (S003/S004)
- `client/e2e/inline-edit.spec.ts` (S003)
- `client/e2e/card-crud.spec.ts` (S002)
- `client/e2e/card-panel.spec.ts` (S002)
- `client/e2e/drag-drop.spec.ts` (S008)
Removed `client/e2e/board.spec.ts`.

## Tests
- External E2E run: 7/7 passing (per user).
- External unit tests run earlier; sandbox test/e2e blocked.

## Key Files Touched
- `client/src/app/models/board.model.ts`
- `client/public/assets/data.json`
- `client/src/app/services/board.service.ts`
- `client/src/app/board/board.component.*`
- `client/src/app/board/card/board-card.component.*`
- `client/src/app/board/list/board-list.component.*`
- `client/src/styles/_tokens.scss`
- `client/e2e/*.spec.ts`
- `specs/M004-card-usability/*`, `specs/_template_milestone.md`

## Notes
- List width locked to 280px to prevent inline-edit layout shifts.
- Add-card row uses flex sizing to prevent button overflow.
- Changes committed externally after this hand-off was drafted.
- Remaining M004 specs (S005–S013) are not yet executed.
- Tests must be run externally due to sandbox restrictions.
