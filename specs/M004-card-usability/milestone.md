# M004-Card Usability: Information-Dense Cards

Conform to `principles.md`.

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
- S001-Card Metadata Model
- S002-Card Detail Side Panel
- S003-Inline Title Editing
- S004-Card Density Layout
- S005-Advanced Markdown Attachments
- S006-Comment Edit History
- S007-Drag Placeholder Cues
- S008-[Nice-to-Have] Quick Actions
- S009-[Nice-to-Have] Activity Indicators
- S010-[Nice-to-Have] Keyboard Shortcuts
- S011-[Nice-to-Have] Completeness Hints
- S012-[Nice-to-Have] Card Footer Icons

## Notes
- Keep existing in-memory state and mock data patterns.
- Maintain compatibility with current drag-and-drop behavior.
