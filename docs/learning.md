# Learnings

Running list of communication/process learnings captured after sessions.

## 2026-01-01

### Where the friction showed up
- Acceptance test logs: clarifying where test outputs live slowed handoff.

### How to communicate more precisely (reduce iteration)
- Note the exact log output location in spec templates (e.g., `client/logs/` with sample filenames).

### Operational learnings (reduce iteration time)
- Playwright browser install timed out in the sandbox; run `npx playwright install` externally before `npm run e2e`.
- E2E web server failed to bind to `127.0.0.1:4200` with `EPERM` in the sandbox; consider an alternate port if it recurs.
- Drag-and-drop E2E is more reliable with mouse-driven drags and small pauses than `dragAndDrop`/`dragTo`.
- E2E assertions are more stable with explicit ids (e.g., `data-card-id`) than list counts or duplicate text.
- Playwright artifacts/logs should live under `client/logs/`.
- Styles for markdown rendered via `innerHTML` must be global (component-scoped styles do not apply).
- CDK drag preview/placeholder styles must be global to apply reliably.
- Karma binding to `127.0.0.1:9877` avoids sandbox issues when running unit tests.
- E2E tests should include spec tags in titles and a `// Spec: S00X` header comment.
- Split E2E spec files when they exceed ~200 lines, span multiple specs, or require divergent setup flows.
- Track progress via session hand-off entries in `session-hand-offs/`.
- Session hand-off filenames should follow `yyyy-mm-dd-nn-title.md` ordering (no spec/milestone ids).
- Use `[ ]`/`[x]` checkboxes in milestone specs; only mark done after all DoD items are checked (or marked "Won't do").

### SCSS nesting conventions
- Keep nesting shallow (depth 2, rarely 3) to avoid specificity creep.
- Group states and direct children under base selectors; avoid long descendant chains.
- Use `&` for related modifiers/states only.

### Scroll surface changes
- Changing horizontal scroll surfaces can break post-close visibility even when open/deep-link scroll works.
- Validate scroll behavior on both panel open and close transitions, not just selection events.

## 2025-12-30

### Where the friction showed up
- Logs access: I asked for logs you already pointed to (“go read e2e.log”), which slowed us down.
- Board settings overlay: we iterated on opacity and element type while untangling `.add-list button` style bleed.
- Hover behavior: “hover doesn’t work” repeated because the exact hover target (input vs. container) wasn’t pinned early.
- Board-not-found actions: placement and wording changed several times, signaling the intended layout wasn’t fully specified up front.

### How to communicate more precisely (reduce iteration)
- Provide the specific element + state + selector scope: e.g., “hover should trigger when the mouse is over the input itself, not the container; apply to `.board-settings-title-input` only.”
- Call out CSS specificity or cascade constraints upfront: e.g., “`.add-list button` is overriding; use a more specific selector or `all: unset`.”
- Use a one-sentence intent + acceptance example: e.g., “Backdrop should dim the page at 20% opacity; visually similar to the card edit overlay.”
- When UI text/placement matters, include the exact desired layout: e.g., “Banner only contains message; actions appear centered below: `Return to Boards | Create New board`.”
- For behavior changes: specify precedence: e.g., “Escape should cancel editing and keep the panel open; never close the panel while editing.”
