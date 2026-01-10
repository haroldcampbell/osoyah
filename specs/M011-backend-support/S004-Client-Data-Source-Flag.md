# S004-Client Data Source Flag

NOTE: THIS SPEC IS WON'T DO

Conform to `docs/principles.md`.

## Summary

NOTE: THIS SPEC IS WON'T DO

Add a client-side flag to switch data loading between `assets/data.json` and the backend API.

## Goal

NOTE: THIS SPEC IS WON'T DO

Enable safe rollout of backend reads without breaking existing mock-data flows.

## Non-goals

NOTE: THIS SPEC IS WON'T DO

-   Removing mock data usage.
-   Implementing backend write support.
-   Changing UI behavior.

## Definition of Done

NOTE: THIS SPEC IS WON'T DO

-   [ ] A configuration flag controls whether the client loads from mock data or backend.
-   [ ] The fallback path retains existing behavior when the flag is off.
-   [ ] Error handling remains consistent with current UI patterns.
-   [ ] Flag behavior is documented for developers and agents.

## Acceptance tests (exact commands + expected artifacts/output)

-   Define exact frontend test command(s); store logs under `client/logs/`.
-   No backend changes required for acceptance.

## Notes (edge cases, hazards, perf constraints)

-   Ensure the flag does not introduce double-fetching or race conditions.
