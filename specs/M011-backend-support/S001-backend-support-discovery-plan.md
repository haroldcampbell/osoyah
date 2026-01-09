# S001-Backend Support Discovery + Plan

Conform to `docs/principles.md`.

## Summary
Analyze current client-only data flow and draft the plan required to add basic backend support, including API contract, migration steps, and test strategy changes.

## Why
Backend support will unlock persistence and multi-user readiness, but requires careful sequencing to avoid breaking existing UI flows and tests.

## Goal
Deliver a concrete plan that outlines what to build, in what order, with clear testing implications and risk mitigation.

## Non-goals
- Implementing backend endpoints or persistence.
- Migrating the app from mock data to backend.
- Introducing auth/permissions beyond placeholders.

## Definition of Done
- [ ] Document current frontend data flow and service boundaries.
- [ ] Draft API contract for core entities (boards, lists, cards, relationships).
- [ ] Outline data model mapping between frontend and backend at a high level (entities + relationships).
- [ ] Define a migration sequencing overview (phases and handoff points only, no JSON/SQLite details).
- [ ] Define updated testing strategy and logging expectations.
- [ ] Identify risks/dependencies and propose a milestone breakdown for implementation.

## Acceptance tests (exact commands + expected artifacts/output)
- N/A (planning-only). Document changes only.

## Notes (edge cases, hazards, perf constraints)
- Keep the plan aligned to FastAPI backend decisions in `docs/decisions.md`.
- Avoid specifying auth details beyond minimal assumptions.
