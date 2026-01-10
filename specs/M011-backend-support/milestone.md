# M011-Backend Support: Discovery + Draft Plan

Conform to `docs/principles.md`.

## Summary
Establish the analysis and draft implementation plan needed to add basic backend support, including sequencing, API surface, data model alignment, and a revised testing strategy.

## Goal
Produce a concrete, reviewable plan for backend integration without implementing backend features yet.

## Scope
In-scope:
- Current frontend data flow analysis (mock data usage, service boundaries, persistence assumptions).
- Draft API contract (endpoints, payloads, error shapes, auth assumptions).
- Draft data model alignment between frontend and backend.
- Migration approach from mock data to backend-backed data.
- Testing strategy update (unit/integration/e2e responsibilities, log locations).
- Risks, dependencies, and milestones for implementation.
Out-of-scope:
- Implementing backend endpoints or persistence.
- Replacing mock data in the running app.
- Auth/permissions beyond placeholder assumptions.

## Specs
- [x] S001-Backend Support Discovery + Plan
- [x] S002-JSON to SQLite Migration Plan
- [x] S003-Read Endpoints + Board Snapshot
- [ ] S004-Client Data Source Flag
- [ ] S005-Board/List/Card CRUD Endpoints
- [ ] S006-Relationship Endpoints + Validation
- [ ] S007-Client Optimistic Updates + Reconciliation
- [ ] S008-Remove Mock Data + Retry/Error States
- [ ] S009-Performance + Logging + Contract Checks
- [ ] S010-Hallucination Guardrails + Source Validation
- [ ] S011-Regression Verification Strategy
- [ ] S012-Data Consistency Checks

## Notes
- Keep this milestone focused on planning; implementation belongs in later milestones.
