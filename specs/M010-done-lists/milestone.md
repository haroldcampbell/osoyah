# M010-Done Lists: Completion Stages

Conform to `docs/principles.md`.

## Summary
Enable boards to configure which lists represent completion so status updates can follow list movement.

## Goal
Let teams mark one or more lists as done for clearer completion semantics.

## Scope
In-scope:
- Board-level configuration for done lists.
- Support multiple done lists per board.
- Persist done list flags in list data.
Out-of-scope:
- Automated list creation or workflow templates.
- Board-level rollups beyond list completion state.

## Specs
- [ ] S001-Done List Configuration

## Notes
- Uses the list `isProcessDone` flag already stored in board data.
