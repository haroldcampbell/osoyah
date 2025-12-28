# AGENTS.md

## Purpose

This repository is operated by an automated coding agent (Codex CLI) using **spec-driven development**.
Changes must be **incremental, auditable, and recoverable**.
All work must conform to the foundational guidance in `docs/principles.md`.

The agent is expected to work autonomously within these rules.

---

## Golden Rules (DO NOT VIOLATE)

1. **Never delete the `.git/` directory**
2. **Never run destructive commands**, including but not limited to:
    - `rm -rf`
    - `git reset --hard`
    - `git clean -fdx`
    - `git checkout -- .`
3. **Never modify files outside this repository**
4. **Never rewrite git history**
    - No force pushes
    - No rebasing existing commits
5. **Assume the user may be away**
    - All actions must be safe to run unattended

Violating any of the above is considered a critical failure.

---

## Scope of Work

-   You may:

    -   Read and edit files **inside this repository**
    -   Create new files and directories as needed
    -   Run commands required to implement specs
    -   Commit changes to git

-   You may NOT:
    -   Access or modify other repositories
    -   Access user home directories except for tool execution
    -   Delete large sections of the project without explicit instruction

---

## Workflow Rules (Mandatory)

1. **Session start**

    - Read `docs/process.md` first and follow its instructions before any other work

1. **Spec-first**

    - All development work must be driven by files in `/specs/`
    - Do not implement features that are not explicitly described in a spec
    - Specs are not required to make changes to ./docs/
    - A spec in Milestone can only be marked as done if and only if, the DoDs in the spec are checked as Done or marked "Won't do"

1. **One spec at a time**

    - Implement exactly one spec per iteration
    - Do not combine multiple specs into a single change
    - The exception to this rule requires explicit instructions to enter 'multi-spec' development. Seek explicit approval.

1. **Minimal diffs**

    - Prefer small, focused changes
    - Do not refactor unrelated code

1. **Acceptance tests**

    - Run the acceptance test(s) specified in the spec
    - If tests fail, fix before committing

1. **Commit discipline**
    - Commit after each successful spec
    - Commit messages should be short and descriptive:
        - `v3: scroll hydration with termination`
        - `feat: cbz export`
        - `fix: ignore logo image`

---

## File & Directory Conventions

-   `/scripts/`
    Primary executable scripts

-   `/specs/`
    Authoritative source of requirements
    Specs are immutable once completed

-   `/out/`
    Generated artifacts (ignored by git)

-   `.vscode/`
    Editor tasks and tooling (optional)

---

## Safety & Recovery Expectations

-   Prefer **adding safeguards** over removing them
-   Log warnings instead of crashing by default
-   When in doubt:
    -   Write diagnostic files (e.g. `count_check.txt`)
    -   Preserve intermediate outputs (`urls.txt`)
-   Assume mistakes must be diagnosable after the fact

---

## Network & Tooling Rules

-   Network access is allowed for:
    -   HTTP/HTTPS requests
    -   Package installation (npm, pip)
-   Do not start long-running background services unless explicitly required by a spec
-   Prefer deterministic, repeatable commands

---

## Performance Expectations

-   Prefer correctness over speed
-   Avoid infinite loops
-   All loops must have clear termination conditions
-   Long-running operations should provide progress output

---

## When Uncertain

If a spec is ambiguous or conflicts with existing behavior:

1. Prefer **existing behavior**
2. Add a comment explaining the ambiguity
3. Make the smallest reasonable change
4. Do NOT guess at user intent beyond the spec

---

## Summary Contract

> **Work incrementally, commit often, never destroy history, and never operate outside the repository.**
