# 2025-12-27-01-drag-placeholder-cues

## Summary
- Moved CDK drag preview/placeholder styling to global styles for reliable application.
- Updated placeholder styling for clearer drop cues without height changes.
- Milestone context: M004 S006-02 Drag Placeholder Cues.

## Work Completed
- Removed component-scoped `.cdk-drag-preview`/`.cdk-drag-placeholder` styles.
- Added global CDK drag preview/placeholder styles in `client/src/styles.scss`.
- Placeholder content hidden; background tint applied.

## Decisions
- CDK drag styles live in global styles to avoid view-encapsulation issues.

## Open Questions
- Confirm placeholder tint/offset values.

## Outstanding
- None.

## Tests
- Not run (per process: user runs externally).
