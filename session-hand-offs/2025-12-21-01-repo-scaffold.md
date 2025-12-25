# 2025-12-21-repo-scaffold

## Summary

-   Set up repo structure for FastAPI server, Angular client, specs, docs, infra, scripts.
-   Added milestone/spec templates and principles guidance.
-   Introduced session hand-off tracking system and template.

## Work Completed

-   Created folders: `server/`, `client/`, `specs/`, `docs/`, `infra/`, `scripts/`, `session-hand-offs/`.
-   Added `specs/milestone.md` and spec/milestone templates.
-   Added `docs/principles.md` and required conformance in `README.md` and spec templates.
-   Added `session-hand-off.md` and `session-hand-offs/_template.md`.
-   Initialized git and added `.gitignore` and `.codexignore`.

## Decisions

-   Use FastAPI for backend and Angular for frontend.
-   Organize specs by milestone folders with numbered spec files.
-   Track progress via session hand-off entries.

## Open Questions

-   Whether to add “Current Focus” section to `session-hand-off.md`.
-   Whether to add placeholders for Summary/Goal in spec templates.

## Next Steps

-   Start first milestone spec drafts using `specs/_template.md`.
-   Flesh out FastAPI and Angular scaffolds if desired.
