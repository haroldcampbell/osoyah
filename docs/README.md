# Docs Overview

This folder holds the lightweight operating rules for the repo. Use these files
to keep work auditable, consistent, and easy to hand off.

## docs/principles.md
- **Purpose:** Foundational engineering and product principles.
- **Use when:** Deciding tradeoffs or evaluating design choices.
- **Updates:** Rare; only when core philosophy shifts.
- **Examples:** "Prefer explicit contracts between layers."

## docs/process.md
- **Purpose:** How we execute work session-to-session.
- **Use when:** Starting a session, reviewing specs, or handing off.
- **Updates:** When workflow steps change or new guardrails are added.
- **Triggers:** New spec workflow rules, hand-off structure changes.
- **Examples:** "Read AGENTS.md first", "Spec review before coding".

## docs/architecture.md
- **Purpose:** High-level system structure, boundaries, and key flows.
- **Use when:** Evaluating cross-cutting changes or onboarding to system shape.
- **Updates:** When major components or integrations change.
- **Triggers:** New services, new data flows, or major refactors.
- **Examples:** "Service boundaries", "Primary data flows".

## docs/decisions.md
- **Purpose:** Current active technical/product decisions.
- **Use when:** Implementing features that depend on settled choices.
- **Updates:** When a decision is made or superseded.
- **Triggers:** Selecting a framework, defining data strategy.
- **Examples:** "Frontend: Angular", "Markdown uses marked + DOMPurify".

## docs/learning.md
- **Purpose:** Captures session learnings to reduce iteration and errors.
- **Use when:** A pattern or pitfall recurs across sessions.
- **Updates:** After sessions when a new learning is confirmed.
- **Triggers:** Repeated friction, test instability, recurring UI confusion.
- **Examples:** "E2E assertions should use data-card-id selectors."

## docs/getting-started/
- **Purpose:** Onboarding and quick-start guidance for the repo (intent still being clarified).
- **Use when:** First-time setup or refreshing context after time away.
- **Updates:** When the onboarding flow is finalized or setup steps change.
- **Triggers:** New tooling, new local setup steps, or clarified onboarding scope.
- **Examples:** "Repo structure tour", "Testing troubleshooting notes".
