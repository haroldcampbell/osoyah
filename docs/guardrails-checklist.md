# Guardrails Checklist

Use this checklist for backend planning and implementation work. This document is required by the workflow in `docs/process.md`.

## Source-of-truth rule

When documenting or implementing backend work, cite sources in this order of precedence:

1. Code (implementation, schemas, migrations).
2. Specs.
3. Docs.

If a claim cannot be tied to a source, mark it as an assumption and assign an owner + follow-up step.

Assumption format:
`ASSUMPTION: <statement>. Owner: <name>. Follow-up: <action/spec>.`

## Review checklist

Use the checklist below for each backend plan or implementation change.

- [ ] Every plan assertion includes at least one source file path and, when relevant, an endpoint (method + path).
- [ ] Each endpoint referenced in the plan is mapped in `docs/api/endpoint-mapping.md` with current frontend usage + data needs.
- [ ] Response/request shapes are validated against code or schema sources (models, schema definitions, migrations).
- [ ] Ordering rules or constraints are explicitly cited when referenced (e.g., list/card ordering).
- [ ] Error cases described in the plan map to actual error responses or are marked as assumptions.
- [ ] Unknowns are flagged with the assumption format and assigned an owner + follow-up step.

## Citation format

Use one of the following patterns for each assertion:

- `Source: backend/server/app/...`
- `Source: client/src/app/...`
- `Source: specs/...`
- `Source: docs/...`
- `Endpoint: GET /api/...`

## Endpoint mapping reminder

The endpoint mapping lives at `docs/api/endpoint-mapping.md`. Update it whenever:

- A backend endpoint is added/changed/removed.
- Frontend usage changes (new endpoint call or data needs).
