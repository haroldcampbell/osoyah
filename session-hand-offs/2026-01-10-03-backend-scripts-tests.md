# 2026-01-10-03-backend-scripts-tests

## Summary
- Standardized backend tooling under `backend/` with Python scripts and documented usage.
- Cleaned up backend test/lint runs, added dependency install helper, and fixed anyio backend to avoid trio failures.
- Milestone context: M011 backend support (S003 read endpoints + tooling updates).

## Work Completed
- Converted backend helper scripts to Python, added install and usage docs, and updated acceptance test command for S003.
- Added ruff/mypy linting flow, logging, and fixed mypy/test issues in backend tests.
- Pinned anyio to asyncio via fixture to avoid missing trio backend.

## Decisions
- Prefer Python scripts over bash/shell scripts for developer tooling (`docs/decisions.md`).

## Open Questions
- None.

## Outstanding (M011)
- S004-Client Data Source Flag (Spec: `specs/M011-backend-support/S004-Client-Data-Source-Flag.md`)
- S005-Board/List/Card CRUD Endpoints (Spec: `specs/M011-backend-support/S005-Board-List-Card-CRUD.md`)
- S006-Relationship Endpoints + Validation (Spec: `specs/M011-backend-support/S006-Relationship-Endpoints-Validation.md`)
- S007-Client Optimistic Updates + Reconciliation (Spec: `specs/M011-backend-support/S007-Client-Optimistic-Updates-Reconciliation.md`)
- S008-Remove Mock Data + Retry/Error States (Spec: `specs/M011-backend-support/S008-Remove-Mock-Data-Add-Retry-Errors.md`)
- S009-Performance + Logging + Contract Checks (Spec: `specs/M011-backend-support/S009-Performance-Logging-Contract-Checks.md`)
- S010-Hallucination Guardrails + Source Validation (Spec: `specs/M011-backend-support/S010-Hallucination-Guardrails-Validation.md`)
- S011-Regression Verification Strategy (Spec: `specs/M011-backend-support/S011-Regression-Verification-Strategy.md`)
- S012-Data Consistency Checks (Spec: `specs/M011-backend-support/S012-Data-Consistency-Checks.md`)

## Next Steps
- Pick the next M011 spec (S004 recommended) and review acceptance tests.
