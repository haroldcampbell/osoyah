# 2026-01-06-02-rollup-metrics

## Summary
- Completed M008 S001 roll-up metrics with config-driven aggregation over board + descendant cards.
- Added roll-up metrics toggle in board settings and a dedicated hierarchy metrics component with updated styling.
- Revised S001 spec to reflect board/descendant scope and created S003 spec for default panel states.

## Work Completed
- Implemented `BoardService` roll-up configuration + aggregation by scope (direct vs descendants).
- Added metrics component under the hierarchy bar with centered large values and rounded metric boxes.
- Added `rollupsEnabled` board setting and UI toggle.
- Updated getting-started docs to remove Excalidraw reference and align locator guidance.
- Updated S001 DoD + milestone checklist; created S003 spec.

## Tests
- User ran `npm run lint`, `npm run format:check`, `npm run e2e` (all passed).

## Open Questions
- For S003: Should hierarchy default closed for all boards or only when hierarchy is available?
- For S003: Should roll-up scope always reset to Direct on load or remember the last selection per board?

## Next Steps
- Implement S003 once defaults are confirmed.
- Consider whether roll-up config should move to persisted board settings in S002.
