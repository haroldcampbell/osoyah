# S003-Collection Schemas + Types: Workspace Data Modeling

Conform to `docs/principles.md`.

## Summary
Allow each workspace to define Collections that represent a type of work (e.g., CRM pipeline, project tasks, manufacturing process) and attach custom properties that apply to all boards in the collection.

## Goal
Users can model their domain once at the collection level and have boards inherit that schema automatically.

## Non-goals
- Arbitrary per-board field builders.
- Cross-collection field inheritance.
- Complex formula fields or automation.

## Definition of Done
- [ ] Collections have a name, type label, and description.
- [ ] Collections define custom properties with type constraints (text, number, date, select).
- [ ] Boards are created within a collection and inherit its custom properties.
- [ ] Card detail views render collection properties consistently.
- [ ] Validation errors are shown when required fields are missing or type rules fail.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Card detail renders collection properties with correct input types.
  - Required field validation shows inline errors.
- `npm run e2e`
  - Create a collection with properties → create board → create card → properties appear.
  - Changing a collection property propagates to all boards in that collection.

## Notes (edge cases, hazards, perf constraints)
- Avoid schema drift by requiring explicit confirmation for destructive changes (e.g., deleting a property).
- Keep property definitions deterministic and versioned to support later migrations.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
