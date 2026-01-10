# 03-002 Toggle Controls

## Guidance
- Use segmented toggle buttons for view mode selection.
- Use buttons with `aria-expanded` for collapsible panels.

## Snippet
```html
<button
  type="button"
  class="board-view-option"
  [class.active]="viewMode === 'cards'"
  [attr.aria-pressed]="viewMode === 'cards'"
>
  Cards
</button>
```

## Examples
- `client/src/app/board/board-toolbar/board-toolbar.component.html`
- `client/src/app/board/board.component.html`

## Problem / Goal
Let users switch between two or more modes quickly with clear current state.

## When to Use
- Use for view mode selection or state toggles visible in the main UI.
- Use when the selection can change instantly without confirmation.

## When Not to Use
- Avoid for destructive actions or irreversible changes.
- Avoid if there are more than a few options; use a menu instead.

## Pros / Cons
- Pros: Fast switching, clear state.
- Cons: Ambiguous if labels are unclear; can feel crowded in small spaces.

## Alternatives / Related Patterns
- Tabs for larger mode sets
- Menus for many options

## External References
- Material Design Segmented Buttons: https://m3.material.io/components/segmented-buttons/overview
