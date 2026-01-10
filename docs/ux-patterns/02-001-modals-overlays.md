# 02-001 Modals + Overlays

## Guidance
- Backdrop button closes the modal; modal uses `role="dialog"` with labeled header.
- Keep primary action on the right, secondary on the left.

## Snippet
```html
<button
  type="button"
  class="board-modal-backdrop"
  aria-label="Close create board dialog"
></button>
<section class="board-modal" role="dialog" aria-modal="true">
  <header class="board-modal-header">
    <div class="board-modal-title">Create board</div>
  </header>
</section>
```

## Examples
- `client/src/app/board/board.component.html`
- `client/src/app/board/card-panel/card-panel.component.html`
- `client/src/app/board/card/board-card.component.html`

## Problem / Goal
Focus the user on a critical task or decision by isolating the flow from the rest of the UI.

## When to Use
- Use for create/edit flows that require dedicated attention.
- Use for confirmations that must be acknowledged before proceeding.

## When Not to Use
- Avoid for simple, low-risk actions that can be done inline.
- Avoid stacking multiple modals.

## Pros / Cons
- Pros: Strong focus, clear primary/secondary actions.
- Cons: Interrupts flow; can be frustrating if overused.

## Alternatives / Related Patterns
- Inline panels
- Toast + inline edit

## External References
- WAI-ARIA Modal Dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Material Design Dialogs: https://m3.material.io/components/dialogs/overview
