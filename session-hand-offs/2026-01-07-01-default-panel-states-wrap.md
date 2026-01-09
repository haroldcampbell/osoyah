# 2026-01-07-01-default-panel-states-wrap

## Summary
- Completed default-state adjustments for hierarchy panel and roll-up scope (S003).
- Added E2E coverage to verify default panel states and roll-up toggle behavior.
- Updated docs overview and clarified process guidance for dropped specs.

## Work Completed
- Set hierarchy panel closed by default and roll-up scope to Direct.
- Updated hierarchy E2E to open the panel before assertions; added a new S003 E2E spec.
- Added `docs/README.md` and moved strike-through guidance into `docs/process.md`.

## Decisions
- Default hierarchy panel state is closed on board load.
- Roll-up metrics default scope is Direct.

## Open Questions
- None.

## Outstanding (M008)
- None (S002 marked "Won't do" in `specs/M008-rollup-metrics/S002-rollup-configuration-experiments.md`).

## Next Steps
- Draft a new spec for persisted roll-up settings when ready.
