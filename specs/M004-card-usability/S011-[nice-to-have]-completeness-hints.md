# S011-[Nice-to-Have] Completeness Hints: Missing Details

Conform to `principles.md`.

## Summary
Add subtle hints on cards when key details are missing (e.g., no description or no comments).

## Goal
Encourage fuller card context without forcing extra steps.

## Non-goals
- Validation that blocks saving.
- Mandatory fields beyond existing requirements.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)
- Hints should be lightweight and not dominate the card layout.
- Hide hints when the card has the related content.
