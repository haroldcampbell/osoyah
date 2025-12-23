# S010-[Nice-to-Have] Keyboard Shortcuts: Fast Navigation

Conform to `principles.md`.

## Summary
Add keyboard shortcuts for common actions (open card, edit title, add comment).

## Goal
Enable faster workflows for power users without sacrificing discoverability.

## Non-goals
- Full keyboard-only navigation of the entire board.
- Custom shortcut configuration.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)
- Provide a visible hint or tooltip for shortcuts.
- Ensure shortcuts do not conflict with browser defaults.
