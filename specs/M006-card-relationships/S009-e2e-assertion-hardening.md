# S009-E2E Assertion Hardening: Card Edit + List Move

Conform to `docs/principles.md`.

## Summary

Tighten two E2E tests to avoid false positives in card title edits and list picker moves.

## Goal

Ensure E2E coverage fails if card title edits or list moves do not actually apply to the intended card.

## Non-goals

- New user-facing features or UI changes.
- Additional E2E scenarios beyond the two targeted assertions.

## Definition of Done

- [x] Inline card title edit test validates the edited title on the same card element that was edited.
- [x] List picker move test verifies the card moved into the target list, not just the trigger label change.
- [x] Existing test structure and setup remain otherwise unchanged.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Prefer `data-testid` or `data-card-id` checks to tie assertions to specific cards.
- Avoid brittle assumptions about list ordering beyond the target card.
- Audit: Reviewed unit tests and E2E tests for false positives or assertions that could pass without exercising the intended behavior.
- Some issues were found, below is the summary of issues found:
  - Low: `client/e2e/inline-edit.spec.ts:29` verifies the updated card title by searching any card with matching text in the list; if another card already has "Updated card title," the test could pass even if the edit fails.
  - Low: `client/e2e/card-panel.spec.ts:33` only checks that the list-picker trigger text changes to "Done"; if a regression updates the label without actually moving the card, this test would still pass (the subsequent scroll test partially mitigates this, but it’s separate).
