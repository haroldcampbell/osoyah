# S010-Hallucination Guardrails + Source Validation

Conform to `docs/principles.md`.

## Summary

Define guardrails that prevent unverified claims during backend planning and implementation by requiring explicit source-of-truth references for all assertions.

## Goal

Ensure every backend plan and implementation decision is traceable to code, specs, or docs (including SQLite schema and ORM models), with a repeatable validation checklist.

## Non-goals

-   Implementing any backend endpoints or client changes.
-   Adding new tooling beyond documentation and checklists.
-   Defining auth/permissions beyond placeholder assumptions.

## Definition of Done

-   [ ] A review checklist exists that requires file/endpoint references for each plan assertion.
-   [ ] A mapping table links planned endpoints to current frontend usage and data needs.
-   [ ] A concise "source-of-truth" rule is documented (what counts as evidence and where it must be cited).
-   [ ] The checklist clarifies how to handle unknowns (flag, defer, or add follow-up spec).

## Acceptance tests (exact commands + expected artifacts/output)

-   N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)

-   Keep references scoped to repo files (`client/`, `backend/server/`, `docs/`, `specs/`).
-   If a claim cannot be tied to a source, it must be tagged as an assumption with an owner and follow-up step.
