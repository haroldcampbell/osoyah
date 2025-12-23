# S012-[Nice-to-Have] Card Footer Icons: Consistent Metadata Row

Conform to `principles.md`.

## Summary
Add a compact card footer icon row for comments/attachments/updated time.

## Goal
Provide a consistent, glanceable metadata area on every card.

## Non-goals
- Adding new metadata beyond what M004 defines.
- Visual overhaul of the board.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)
- Icons should be minimal and consistent with existing styling tokens.
- Avoid adding more than one row of icons to keep cards compact.
