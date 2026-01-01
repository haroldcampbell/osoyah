# S001-Organization + Workspace Roles: Role Boundaries

Conform to `docs/principles.md`.

## Summary
Define Organization and Workspace membership models with clear role tiers so agencies can manage internal teams and client access without ambiguous permissions.

## Goal
Users can understand who can manage billing, people, and work in under 30 seconds by reading the role labels and their permissions.

## Non-goals
- Billing workflows or invoice management.
- Per-collection permission overrides.
- Enterprise SSO or SCIM provisioning.

## Dependencies
- M-diff-000-S001 (Organization + Workspace Model)

## Definition of Done
- [ ] Organization roles exist: Owner, Admin, Member.
- [ ] Workspace roles exist: Manager, Editor, Viewer.
- [ ] A user can belong to one Organization and multiple Workspaces.
- [ ] Organization Owners/Admins can manage org members and workspaces.
- [ ] Workspace Managers can add/remove workspace members.
- [ ] Workspace Editors can create/edit cards and boards.
- [ ] Workspace Viewers have read-only access.
- [ ] UI surfaces role labels and permission descriptions on membership screens.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Membership UI renders role labels and descriptions.
  - Read-only UI state is enforced for Viewer (disabled controls, no create actions).
- `npm run e2e`
  - Manager can add a Viewer to a workspace and Viewer cannot edit a card.
  - Admin can create a workspace; Member cannot.

## Notes (edge cases, hazards, perf constraints)
- Keep a single source of truth for permissions to avoid drift between UI and API checks.
- If a user is removed from a workspace, they should lose access immediately on next refresh.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
