# S001-Project Templates: Opinionated Defaults

Conform to `docs/principles.md`.

## Summary
Ship versioned templates for agency workflows (e.g., client onboarding, delivery pipeline, ongoing retainer) to reduce setup time and avoid blank-canvas entropy.

## Goal
A user can create a useful board/collection in under 3 minutes without admin-level decisions.

## Non-goals
- Arbitrary workflow designers.
- Per-template visual customization.
- Supporting every methodology.

## Definition of Done
- [ ] Templates are versioned with `id`, `name`, and `version` metadata.
- [ ] Template creation produces a board with default lists, statuses, and starter cards.
- [ ] Templates are selectable during board creation.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)
- `npm test`
  - Template selector renders with descriptions.
  - UI handles loading/empty/error states.
- `npm run e2e`
  - Selecting a template creates a board with the expected lists and starter cards.

## Notes (edge cases, hazards, perf constraints)
- Template upgrades should require explicit user confirmation.
- Avoid large JSON blobs without tests; keep templates modular.
- Product differentiation context: `business/research/2025-12-29-01-product-differentiation.md`.
