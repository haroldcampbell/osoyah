# 01-006 Status Tags + Badges

## Guidance
- Use short, visually distinct tags to convey state.

## Snippet
```html
<span class="board-panel-badge archived">Archived</span>
```

## Examples
- `client/src/app/board/board-panel/board-panel.component.html`
- `client/src/app/board/card-panel/card-panel.component.html`

## Problem / Goal
Provide quick visual status cues for items without adding heavy UI.

## When to Use
- Use for small, discrete states (e.g., Archived, Current).
- Keep labels short and consistent.

## When Not to Use
- Avoid for primary actions or complex state combinations.
- Do not stack too many tags on a single item.

## Pros / Cons
- Pros: Fast scanning, low space usage.
- Cons: Too many tags reduce clarity; color-only cues can hurt accessibility.

## Alternatives / Related Patterns
- Inline text status
- Icons with labels

## External References
- Material Design Badges: https://m3.material.io/components/badges/overview
