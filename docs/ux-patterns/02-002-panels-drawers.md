# 02-002 Panels + Drawers

## Guidance
- Panels use `aside` containers with persistent layout (card panel, board panel).
- Drawer variant uses a fixed overlay with a backdrop to close.

## Snippet
```html
<aside class="board-panel" data-testid="board-panel">
  <header class="board-panel-header">...</header>
</aside>
```

## Examples
- `client/src/app/board/board-panel/board-panel.component.html`
- `client/src/app/board/card-panel/card-panel.component.html`
- `client/src/app/board/board-hierarchy-drawer/board-hierarchy-drawer.component.html`

## Problem / Goal
Provide persistent or secondary context without navigating away from the main workspace.

## When to Use
- Use side panels for detailed views (cards, settings) while keeping the board visible.
- Use drawers on narrow viewports to preserve space.

## When Not to Use
- Avoid for short confirmations or single actions better handled inline.
- Avoid if the panel hides critical context without a clear close affordance.

## Pros / Cons
- Pros: Keeps context visible; supports multitasking.
- Cons: Reduces horizontal space; can feel crowded on small screens.

## Alternatives / Related Patterns
- Full-page detail views
- Modals for focused edits

## External References
- Material Design Navigation Drawer: https://m3.material.io/components/navigation-drawer/overview
