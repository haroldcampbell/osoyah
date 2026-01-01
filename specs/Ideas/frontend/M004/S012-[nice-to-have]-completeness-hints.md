# S012-[Nice-to-Have] Completeness Hints: Missing Details

Conform to `docs/principles.md`.

## Summary
Add subtle hints on cards when key details are missing (e.g., no description or no comments).

## Goal
Encourage fuller card context without forcing extra steps.

## Non-goals
- Validation that blocks saving.
- Mandatory fields beyond existing requirements.

## Definition of Done
- [ ] Cards show subtle hints when descriptions or comments are missing.
- [ ] Hints are hidden when the related content exists.
- [ ] Hints stay lightweight and do not dominate the card layout.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
