# 2026-01-10-05-s006-relationships-env-db

## Summary
- Implemented S006 relationship endpoints with validation, configurable depth, and tests.
- Enforced environment-specific SQLite databases and test-only DB usage rules in docs and tooling.
- Milestone context: M011 backend support (S006 complete).

## Work Completed
- Added card/board relationship endpoints, validation helpers, and max-depth config.
- Added relationship tests and updated acceptance test commands across backend specs.
- Added app runner env flag and environment-specific DB selection in config.
- Ignored SQLite database files in git via `.gitignore`.
- Updated AGENTS/process/principles/decisions to require test DB isolation.

## Decisions
- Relationship tables do not add standalone guids unless relationships become first-class entities.
- Separate SQLite DBs per environment with tests restricted to `osoyah-test.db`.

## Open Questions
- None.

## Outstanding (M011)
- S007-Client Optimistic Updates + Reconciliation (Spec: `specs/M011-backend-support/S007-Client-Optimistic-Updates-Reconciliation.md`)
- S008-Remove Mock Data + Retry/Error States (Spec: `specs/M011-backend-support/S008-Remove-Mock-Data-Add-Retry-Errors.md`)
- S009-Performance + Logging + Contract Checks (Spec: `specs/M011-backend-support/S009-Performance-Logging-Contract-Checks.md`)
- S010-Hallucination Guardrails + Source Validation (Spec: `specs/M011-backend-support/S010-Hallucination-Guardrails-Validation.md`)
- S011-Regression Verification Strategy (Spec: `specs/M011-backend-support/S011-Regression-Verification-Strategy.md`)
- S012-Data Consistency Checks (Spec: `specs/M011-backend-support/S012-Data-Consistency-Checks.md`)

## Next Steps
- Review and start S007.
