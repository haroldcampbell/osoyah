# M-future-005-Card Relationship Integrity (Backend)

Conform to `docs/principles.md`.

## Summary
Define backend data constraints and validation rules for parent/child card relationships.

## Goal
Ensure relationship integrity (single parent, no cycles, valid references) at persistence and API layers.

## Scope
In-scope:
- SQL-friendly schema design for card relationships.
- Constraints and validation for single-parent rules.
- Cycle prevention strategy and API validation.
Out-of-scope:
- UI or client-side relationship editing flows.
- Migration of existing data beyond documented steps.

## Specs
- [ ] S001-Backend Relationship Integrity

## Notes
- This milestone is owned by the backend team.
