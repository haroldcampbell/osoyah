# S005-Parent Selector: CDK Dropdown + Search

Conform to `docs/principles.md`.

## Summary
Replace the parent selector dropdown with a CDK-based dropdown that includes a search field for partial matches.

## Goal
Make it faster to find a parent card in large datasets.

## Non-goals

- Keyboard shortcuts beyond standard dropdown focus behavior.
- Fuzzy matching beyond partial string matches.
- Backend search or pagination.

## Definition of Done

- [ ] Parent selector uses a CDK dropdown (not native select).
- [ ] Dropdown includes a search input at the top.
- [ ] Search matches partial text against card id and title.
- [ ] Empty state appears when no results match.
- [ ] Existing parent selection rules (single parent, no cycles) still apply.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Keep dropdown usable on narrow viewports.
- Preserve the current selection while filtering.
