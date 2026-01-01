# S004-Activity Summary Draft: Digest Preview

Conform to `docs/principles.md`.

## Summary
Provide a summary draft view that aggregates recent activity into a digest suitable for email or sharing.

## Goal
Let users preview and copy a concise activity summary from the UI.

## Non-goals

- Automated scheduling or delivery.
- Multi-user personalization.
- PDF or export workflows beyond copy.

## Definition of Done

- [ ] Summary view supports time ranges (Today, Last 7 days, Last 30 days).
- [ ] Summary groups activity by board and lists top cards with counts.
- [ ] Summary includes totals for created, moved, and commented events.
- [ ] A Copy Summary action copies a plain-text digest to the clipboard.
- [ ] Summary view shows a clear empty state when no activity exists.
- [ ] Acceptance tests pass.

## Acceptance tests (exact commands + expected artifacts/output)

- Log output is stored in `./client/logs/` (for example: `lint.log`, `prettier.log`, `e2e.log`, `test.log`).
- `npm run lint` passes.
- `npm run test` passes.

## Notes (edge cases, hazards, perf constraints)

- Summaries should exclude activity older than the selected time range.
- Keep summary text deterministic for future snapshot tests.
