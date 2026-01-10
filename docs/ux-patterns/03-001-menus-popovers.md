# 03-001 Menus + Popovers

## Guidance
- Use `details` + `summary` for simple overflow menus.
- Use CDK menus for searchable or structured menus.

## Snippet
```html
<details class="list-menu">
  <summary class="list-menu-button" aria-label="List actions">
    <span class="list-menu-icon" aria-hidden="true"></span>
  </summary>
  <div class="list-menu-popover">...</div>
</details>
```

## Examples
- `client/src/app/board/list/board-list.component.html`
- `client/src/app/board/card-panel/card-panel.component.html`
- `client/src/app/board/board-toolbar/board-toolbar.component.html`

## Problem / Goal
Expose secondary actions without cluttering the primary UI.

## When to Use
- Use for secondary/overflow actions or option lists.
- Use searchable menus for large sets.

## When Not to Use
- Avoid hiding primary actions inside menus.
- Avoid deep nesting or long, unscannable lists.

## Pros / Cons
- Pros: Saves space; keeps UI clean.
- Cons: Actions are hidden; discoverability can suffer.

## Alternatives / Related Patterns
- Inline action buttons
- Toolbars with visible actions

## External References
- WAI-ARIA Menu Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- Material Design Menus: https://m3.material.io/components/menus/overview
