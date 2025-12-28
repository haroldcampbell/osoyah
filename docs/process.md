# Collaborative Process (Lean)

This file is a lightweight entry point. It links to the authoritative rules
and focuses on how we work session-to-session.

## Core References

-   `AGENTS.md` is the source of truth for safety and workflow constraints.
-   `docs/principles.md` is the foundation for all engineering and product decisions.
-   `docs/decisions.md` holds active technical decisions that must be respected.

## Session Start

-   Read `AGENTS.md`, `docs/principles.md`, and `docs/decisions.md`.
-   Read the latest entry in `session-hand-offs/` and the index in `session-hand-off.md` for current status and next steps.
-   Before any implementation, begin with a collaborative review of the target spec to confirm scope, acceptance tests, and open questions.
-   When asked "Where should we start?", or similar questions, recommend the next product spec to work on. Treat this as a prompt to collaboratively review the next spec (or the one last worked on) before actually starting to code.

## Spec-First Execution

-   Work from a single spec in `/specs/`; do not mix specs.
-   All development starts with the spec review; no coding before the
    spec is reviewed together.
-   Keep changes minimal and aligned with `docs/principles.md`.
-   When ambiguous, prefer existing behavior and document the choice.

## Testing Loop

-   The agent does not run unit or E2E tests in the sandbox.
-   The user runs `npm run test` and `npm run e2e` externally; logs are stored in
    `client/logs/` for review.
-   Any new testing method should explicitly write logs under `client/logs/`.
-   Recommend splitting E2E specs when files exceed ~200 lines, cover multiple specs, or need divergent setup flows.

## Hand-Offs and Decisions

-   Add a session entry in `session-hand-offs/` using `yyyy-mm-dd-nn-title.md`.
-   Update `docs/decisions.md` when decisions change.
