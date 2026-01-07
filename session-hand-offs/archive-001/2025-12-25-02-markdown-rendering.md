# 2025-12-25-02-markdown-rendering

## Summary
- Implemented S006-01 Markdown rendering using marked + DOMPurify with safe output on cards, panel description, and comments.
- Added E2E coverage for markdown rendering and updated card/panel E2E click targets.
- Updated markdown reference card content for broader coverage.

## Work Completed
- Added `MarkdownService` and wired markdown rendering into card previews, panel description view mode, and comment bodies.
- Styled markdown output for headings, lists, code blocks, blockquotes, and images; kept CSS-only truncation on cards.
- Split markdown E2E test into three focused tests and stabilized card/panel click actions.
- Upgraded Angular dependencies to 19.2.17 and removed `ansi-escapes` override after rebuild.

## Decisions
- Keep CSS-only clamp for card markdown previews (no source/HTML truncation).
- Single-asterisk emphasis (`*text*`) renders as bold to match Slack/WhatsApp behavior.

## Open Questions
- None.

## Outstanding
- S006-02 Markdown Attachments not started.
- S006-03 Panel Width + Save Notification not started.

## Tests
- `npm run lint` (pass)
- `npm run test` (pass)
- `npm run e2e` (pass)
