# M004-Card Usability: Information-Dense Cards

Conform to `docs/principles.md`.

## Summary
Improve card usability by making cards more information-dense and editable, with a Trello/Asana-inspired detail view for descriptions, comments, and metadata.

## Goal
Enable teams to capture and view more card detail without leaving the board, while keeping interactions fast and familiar.

## Scope
In-scope:
- Extend card data to include description, created-at timestamp, and comments/posts.
- Add a card detail side panel opened from the board.
- Support quick editing of list titles and card titles.
- Surface more card metadata directly on cards (dense layout).
Out-of-scope:
- Multi-user features (realtime updates, permissions, presence).
- Server persistence or new backend APIs.
- New board types or non-kanban workflows.

## Specs
- [x] S001-Card Metadata Model
- [x] S002-Card Detail Side Panel
- [x] S003-Inline Title Editing
- [x] S004-Interaction Hygiene
- [x] S005-Card Density Layout
- [ ] S006-Advanced Markdown Attachments
- [ ] S007-Comment Edit History
- [ ] S008-Drag Placeholder Cues
- [ ] S009-[Nice-to-Have] Quick Actions
- [ ] S010-[Nice-to-Have] Activity Indicators
- [ ] S011-[Nice-to-Have] Keyboard Shortcuts
- [ ] S012-[Nice-to-Have] Completeness Hints
- [ ] S013-[Nice-to-Have] Card Footer Icons

## Notes
- Keep existing in-memory state and mock data patterns.
- Maintain compatibility with current drag-and-drop behavior.
