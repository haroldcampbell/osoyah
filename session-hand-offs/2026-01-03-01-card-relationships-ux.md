# 2026-01-03-01-card-relationships-ux

## Summary
- Completed M006 S002/S003 relationship integrity + side-panel UX with system comments, parent/child navigation, and modal unlinking.

## Work Completed
- Enforced single-parent + cycle prevention rules in `BoardService` with UI blocking.
- Added system comments on parent/child link/unlink, including bold clickable card labels.
- Added parent selector, children list, and navigation actions in the card panel.
- Replaced child unlink confirm with a modal dialog including card ids.
- Added comment `authorType` field and normalized mock data.
- Added unit + e2e coverage for relationship behaviors.
- Added future specs S004 (child completion count) and S005 (CDK parent selector) and updated milestone checklist.
- Refined card list UI with card id placement, children list styling, and panel spacing tweaks.

## Decisions
- System relationship comments use markdown with bold, linked card labels when the board is known.
- Child unlink confirmation uses the existing modal pattern (not `window.confirm`).

## Open Questions
- None.

## Outstanding
- Re-run `ng s` to confirm the modal template guard fix resolves the dev server error.
- Future work: implement S004 child completion count + status model, and S005 CDK dropdown with search.

## Tests
- User reported `npm run lint`, `npm run format:check`, `npm run test`, and `npm run e2e` passing.

## Next Steps
- Verify `ng s` is clean after the template nullability fix.
- Start S004 or S005 based on priority.
