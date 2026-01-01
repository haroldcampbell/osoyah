# M-diff-001-Structured-Workspaces: Structured Workspaces + Collections

Conform to `docs/principles.md`.

## Summary
Introduce Organization, Workspace, and Collection primitives with clear role boundaries and workspace-wide card identity. This formalizes the hierarchy described in the product differentiation discussion and enables agency/client separation without per-collection permissions.

## Goal
Represent agency hierarchies (org, workspaces, collections) with predictable permissions and workspace-scoped card IDs that scale across multiple boards.

## Scope
In-scope:
- Organization and Workspace membership models with role tiers.
- Workspace-wide monotonically increasing card IDs.
- Collection types with schema-defined custom properties.
- Collection rollups that do not affect permissions.

Out-of-scope:
- Billing workflows or invoices.
- Per-collection permission overrides.
- Cross-workspace rollups.

## Specs
- [ ] S001-Organization + Workspace Roles
- [ ] S002-Workspace Card Identity
- [ ] S003-Collection Schemas + Types
- [ ] S004-Collection Rollups (Nested)

## Notes
Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
