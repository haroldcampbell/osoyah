# Idea: Multi-Parent Board Hierarchy (Workspace Option)

## Summary
Allow boards to have multiple parents in the hierarchy, gated by a workspace setting.

## Why
Multi-parent boards can model cross-cutting initiatives or shared programs without duplicating boards.
Examples include shared initiatives across multiple goals, matrix orgs, or program boards spanning multiple teams.

## Considerations
- Breadcrumbs and tree views become ambiguous without a primary path.
- UI needs to clarify which parent path is active or selected.
- Cycles become easier to introduce, so validation must be stronger.
- Reparenting UX must handle multiple parent selections and removals.

## Potential UX Approach
- Workspace setting: "Allow multi-parent boards" (default off).
- When enabled, show a parent multi-select with a primary path choice.
- Breadcrumbs follow the selected primary path.
