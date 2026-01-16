# S014-Process-Session-Hand-Off-Naming

Conform to `docs/principles.md`.

## Summary

Process spec: update session hand-off naming to include milestone identifiers, then rename existing hand-off files and update related documentation to match the new rule.

## Goal

Make session hand-off filenames explicitly include the milestone identifier to improve traceability.

## Non-goals

-   Changing the content or structure of existing hand-off entries beyond filename/index updates.
-   Introducing automation beyond basic renaming and documentation updates.

## Definition of Done

-   [ ] The naming rule is updated in `AGENTS.md`, `docs/process.md`, and `session-hand-off.md`.
-   [ ] All existing hand-off filenames are renamed to include the milestone identifier.
-   [ ] `session-hand-off.md` index entries match the renamed files.
-   [ ] Any documentation references to the old naming rule are updated.
-   [ ] Spec notes clarify the final filename format for milestone identifiers.

## Acceptance tests (exact commands + expected artifacts/output)

-   N/A (documentation + rename only).

## Notes (edge cases, hazards, perf constraints)

-   Confirm the filename format for milestone inclusion (example: `yyyy-mm-dd-nn-m011-title.md`).
-   Ensure archive summaries and any references in docs are updated to the new filenames.
