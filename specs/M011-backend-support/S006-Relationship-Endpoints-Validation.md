# S006-Relationship Endpoints + Validation

Conform to `docs/principles.md`.

## Summary

Implement backend endpoints and validations for card and board relationships, matching current client behavior.

## Goal

Support parent/child relationships with cycle prevention and depth checks consistent with the frontend.

## Non-goals

-   UI changes to relationship management.
-   Auth/permissions beyond placeholders.

## Definition of Done

-   [ ] Endpoints exist for creating and removing card relationships.
-   [ ] Endpoints exist for creating and removing board relationships.
-   [ ] Validation prevents self-links, cycles, and depth violations.
-   [ ] Relationship creation timestamps are stored server-side.
-   [ ] Error responses follow the agreed JSON error shape.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact backend test command(s); store logs under `server/logs/`.
-   Document any manual verification steps.

## Notes (edge cases, hazards, perf constraints)

-   Ensure unlink operations cleanly remove references without side effects.
-   Maintain consistency with frontend helper rules in `BoardService`.
