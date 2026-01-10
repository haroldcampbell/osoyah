# Collaborative Process (Lean)

This file is a lightweight entry point. It links to the authoritative rules
and focuses on how we work session-to-session.

## Core References

-   `AGENTS.md` is the source of truth for safety and workflow constraints.
-   `docs/principles.md` is the foundation for all engineering and product decisions.
-   `docs/decisions.md` holds active technical decisions that must be respected.
-   `docs/ux-patterns.md` defines UX feedback patterns and copy guidelines.
-   `docs/learning.md` captures process and execution learnings; consult before starting work to reduce iteration.
    -   See the "Component refactor checklist" entry in `docs/learning.md` when extracting UI sections.

## Session Start

-   Read `AGENTS.md`, `docs/principles.md`, `docs/decisions.md`, `docs/ux-patterns.md`, and `docs/learning.md`.
-   Read the latest entry in `session-hand-offs/`, the index in `session-hand-off.md`, and any `session-hand-offs/archive-00x/summary.md` for older context.
-   Before any implementation, begin with a collaborative review of the target spec to confirm scope, acceptance tests, and open questions.
-   When asked "Where should we start?", or similar questions, recommend the next product spec to work on. Treat this as a prompt to collaboratively review the next spec (or the one last worked on) before actually starting to code.

## Spec-First Execution

-   Work from a single spec in `/specs/`; do not mix specs.
-   All development starts with the spec review; no coding before the
    spec is reviewed together.
-   The first step in the spec review process requires the Agent to ask clarifying questions or making recommendations to improve the spec when necessary. The use of numbered lists is preferred.
-   Keep changes minimal and aligned with `docs/principles.md`.
-   When ambiguous, prefer existing behavior and document the choice.
-   Once the agent confirms the spec DoDs are met, check off the spec's DoD items.
-   When all DoD items are checked, mark the spec complete in the corresponding `milestone.md`.
-   When dropping a spec in a milestone checklist, use Markdown strike-through on the spec title (e.g., `~~S002-Example~~`) and note the status (e.g., "Won't do") to make intent explicit.
-   When all the specs in a milestone.md are done, update the /specs/milestone.md ("Won't do" should not be considers as a blocker to this criteria)

## Testing Loop

-   The agent does not run unit or E2E tests in the sandbox.
-   The user runs `npm run test` and `npm run e2e` externally; logs are stored in
    `client/logs/` for review.
-   Any new testing method should explicitly write logs under `client/logs/`.
-   Recommend splitting E2E specs when files exceed ~200 lines, cover multiple specs, or need divergent setup flows.
-   For new or updated E2E tests, add a quick false-positive check: confirm at least one assertion proves the intended state change for the intended entity (not just a label or generic text).

## Hand-Offs and Decisions

-   Add a session entry in `session-hand-offs/` using `yyyy-mm-dd-nn-title.md`.
-   Update `docs/decisions.md` when decisions change.
-   After drafting a hand-off, review potential learnings and ask the user which items to save in `docs/learning.md`. If confirmed, append a dated entry.
-   Before the session hand-offs is written, the Agent must review and update the relevant spec DoDs.
-   Archive summaries must include:
    -   Executive summary (1–2 paragraphs max)
    -   Highlights by theme
    -   Key decisions with provenance citations
    -   Compacted summary of work completed
    -   Learnings + patterns captured
    -   Outstanding items and open questions at archive close
    -   Explicit citation format (e.g., `[2026-01-01-06]`)

## Agent Directive

Once you have read the process, ensure the following:

1. You know the location of the acceptance test logs
2. You understand the process. You don't need to give a summary.
3. Confirm the next unit for work and prompt to review the spec.

### Hand-off feedback

During the Hand-offs and session wrap-up, do the following:

1. Give the user feedback on the quality of their prompts and communication during the session.

-   Use a 1-5 score (5 is best).
-   Give concrete examples of what to keep doing and what to avoid.

2. Use the feedback to guide the user toward better collaboration and delivery.

3. Be kind and direct with your feedback.
