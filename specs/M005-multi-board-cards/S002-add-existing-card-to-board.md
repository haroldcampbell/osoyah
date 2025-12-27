# S002-Add Existing Card to Board: Cross-Pipeline Moves

Conform to `docs/principles.md`.

## Summary
Add UI and flows to attach an existing card to another board so deals can move across pipelines without duplication.

## Goal
Make it fast to add an existing card to a board with no primary board concept.

## Non-goals
- Batch moves across multiple boards.
- New permissions or multi-user collaboration.

## Definition of Done
- [ ] Users can add an existing card to a target board from the UI.
- [ ] Card appears in the selected list on the target board without duplication.
- [ ] Source board retains the card unless explicitly removed.
- [ ] No primary board is implied in UI copy.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)
- Define default list selection behavior for newly attached cards.
