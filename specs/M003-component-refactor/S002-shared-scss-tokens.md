# S002-Shared SCSS Tokens: Styling Primitives

Conform to `principles.md`.

## Summary
Introduce shared SCSS variables for spacing, radii, colors, and button sizing.

## Goal
Centralize styling primitives to make the UI consistent and easier to evolve.

## Non-goals
- A full theming system or design overhaul.
- New UI components beyond list/card refactor.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm run lint` passes.
- `npm run format:check` passes.

## Notes (edge cases, hazards, perf constraints)
- Prefer a single tokens file (e.g., `client/src/styles/_tokens.scss`).
- Replace magic numbers in component styles with tokens.
