# S012-Data Consistency Checks

Conform to `docs/principles.md`.

## Summary

Define consistency checks that ensure board/list/card data stays coherent during backend integration, with clear ownership and failure handling.

## Goal

Document the required consistency validations for ordering, membership, and relationships, and where those checks should live across SQLite constraints and application logic.

## Non-goals

-   Implementing runtime validators or migrations.
-   Changing data models beyond documenting expected invariants.
-   Introducing background services.

## Definition of Done

-   [ ] Core invariants are documented (ordering, membership, relationships, timestamps).
-   [ ] Each invariant identifies where validation should occur (frontend service, backend endpoint, or shared helper).
-   [ ] Failure handling is defined (error response, warning log, or corrective action).
-   [ ] A lightweight validation approach is proposed for pre-merge verification.

## Acceptance tests (exact commands + expected artifacts/output)

-   N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)

-   Multi-board card membership must remain consistent with list membership records.
-   Relationship integrity must prevent cycles and orphaned links.
-   Identify which invariants are enforced via SQLite constraints vs. ORM-level validation.
