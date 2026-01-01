# Learnings

Running list of communication/process learnings captured after sessions.

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

## 2026-01-01

### Where the friction showed up
- Acceptance test logs: clarifying where test outputs live slowed handoff.

### How to communicate more precisely (reduce iteration)
- Note the exact log output location in spec templates (e.g., `client/logs/` with sample filenames).
