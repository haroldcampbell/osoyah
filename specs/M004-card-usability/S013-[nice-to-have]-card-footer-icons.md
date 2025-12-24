# S013-[Nice-to-Have] Card Footer Icons: Consistent Metadata Row

Conform to `principles.md`.

## Summary
Add a compact card footer icon row for comments/attachments/updated time.

## Goal
Provide a consistent, glanceable metadata area on every card.

## Non-goals
- Adding new metadata beyond what M004 defines.
- Visual overhaul of the board.

## Definition of Done
- [ ] Card footer shows a compact icon row for comments, attachments, and updated time.
- [ ] Icons are minimal and align with existing styling tokens.
- [ ] Footer remains a single row to keep cards compact.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.
