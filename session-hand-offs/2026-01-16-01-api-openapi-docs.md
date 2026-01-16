# 2026-01-16-01-api-openapi-docs

## Summary
- Documented API output examples with curl-based samples and schema references.
- Established OpenAPI JSON as the canonical API contract with an export script.
- Milestone context: M011 S010 complete; API docs aligned with guardrails.

## Work Completed
- Added schema references to each endpoint section in `docs/api/*-api-output.md`.
- Consolidated base-path guidance in `docs/api/README.md`.
- Added `backend/scripts/export_openapi.py` and documented it in `backend/scripts/README.md`.
- Recorded OpenAPI contract decision and updated process guidance for refreshes.

## Decisions
- `docs/api/openapi.json` is the canonical API contract; refresh via `python backend/scripts/export_openapi.py`.

## Open Questions
- Should OpenAPI export be enforced in CI or a pre-merge check?

## Outstanding (M011)
- S011 Regression Verification Strategy (Spec: `specs/M011-backend-support/S011-Regression-Verification-Strategy.md`)
- S012 Data Consistency Checks (Spec: `specs/M011-backend-support/S012-Data-Consistency-Checks.md`)
- S013 API Board Service Refactor (Spec: `specs/M011-backend-support/S013-Api-Board-Service-Refactor.md`)

## Next Steps
- Decide whether to enforce OpenAPI export freshness in CI.
- Proceed with S011 or S012 in M011.
