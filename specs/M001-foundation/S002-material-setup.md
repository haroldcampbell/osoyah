# S002-Angular Material Setup

Conform to `principles.md`.

## Summary
Install and configure Angular Material with a baseline theme and typography.

## Goal
Ensure Material components are available and a consistent visual foundation is in place.

## Non-goals
- Build application UI screens
- Create custom design system tokens beyond a basic theme

## Acceptance tests (exact commands + expected artifacts/output)
- `ng add @angular/material` completes successfully
- Material theme is configured in `src/styles.scss` and referenced in `angular.json`
- Animations provider is configured in `src/app/app.config.ts`
- A basic theme is configured and applied in global styles
- `ng serve` renders the starter app without console errors

## Notes (edge cases, hazards, perf constraints)
- Keep the theme simple and easy to swap later.
- Ensure typography is set once and not duplicated.
