# S0XX-Soft Deletes + Trash + Undelete

## Summary

Introduce soft deletes for boards, lists, and cards, plus a trash view and restore capability.

## Goals

- Preserve deleted records via soft-delete flags or timestamps.
- Provide a trash view for recently deleted items.
- Allow restoring deleted items with original relationships and ordering where possible.

## Non-goals

- Full audit history.
- Permanent retention policies.

## Notes

- Decide whether to use `deleted_at` timestamps or boolean flags.
- Ensure list/card membership cleanup preserves restore capability.
- Define how long items stay in trash before hard deletion.
