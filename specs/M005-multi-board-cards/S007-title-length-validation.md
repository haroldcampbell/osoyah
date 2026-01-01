# S007-Title Length Validation: Boards + Cards

Conform to `docs/principles.md`.

## Summary

Enforce minimum and maximum title lengths for boards and cards to prevent invalid or overly long names.

## Goal

Keep board and card titles readable and consistent while blocking invalid lengths.

## Non-goals

- Server-side validation or persistence.
- Localization-aware length rules.
- Retrofitting existing data (only apply on edits/creates).

## Definition of Done

- [x] Board titles require 3–40 characters after trimming.
- [x] Card titles require 3–90 characters after trimming.
- [x] Existing title edits and creates show validation errors and block save when invalid.
- [x] Validation messages are consistent with existing error tone.
- [x] Card titles on board lists are edited via a hover-triggered edit icon (right aligned), not by clicking the title directly.
- [x] Card title edit uses a modal/popup with Save/Cancel actions and is dismissable via Escape.
- [x] Existing flows continue to work for valid titles.
- [x] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run e2e` passes.

## Notes (edge cases, hazards, perf constraints)

- Apply the same rules in list card creation, inline card edits, and panel title edits.
- Ensure validation does not break keyboard flows (enter to save).
