# S001-Organization + Workspace Model: Core Structure

Conform to `docs/principles.md`.

## Summary
Define the Organization and Workspace data model primitives so agencies can separate internal teams from client-facing work.

## Goal
Create explicit, testable data contracts for organizations, workspaces, and memberships that other specs can depend on.

## Non-goals
- Billing or subscription management.
- Permission UI or role editing screens.
- External identity providers.

## Definition of Done
- [ ] Organization model includes: `id`, `name`, `created_at`.
- [ ] Workspace model includes: `id`, `organization_id`, `name`, `created_at`.
- [ ] Membership model supports user-to-organization and user-to-workspace relationships.
- [ ] Data model is documented in `docs/architecture.md`.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Data model types are validated.
- `npm run e2e`
  - Creating a workspace requires an organization.

## Notes (edge cases, hazards, perf constraints)
- Keep organization and workspace IDs stable and opaque.
- Avoid circular references or implicit defaults.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
