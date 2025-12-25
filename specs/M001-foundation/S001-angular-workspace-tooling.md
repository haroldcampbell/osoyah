# S001-Angular Workspace + Tooling

Conform to `docs/principles.md`.

## Summary
Set up the Angular workspace with core dev tooling and conventions for consistent local development.

## Goal
Provide a clean, repeatable front-end setup with linting/formatting and a predictable project layout.

## Non-goals
- Configure production deployment
- Implement application features

## Acceptance tests (exact commands + expected artifacts/output)
- `npm install` completes with no errors
- `npm run lint` succeeds with no lint errors
- `npm run format:check` completes without changes
- `ng version` shows a working Angular CLI

## Notes (edge cases, hazards, perf constraints)
- Keep config minimal; avoid heavy customizations this early.
- Prefer standard Angular workspace structure.
- Workspace lives under `client/`.
