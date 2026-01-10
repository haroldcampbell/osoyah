# 01-003 Empty States

## Guidance
- Keep empty copy short and actionable when a next step exists.
- Use a single-line explanation; include a CTA button when creation is the next action.

## Snippet
```html
<div class="board-hierarchy-empty" data-testid="hierarchy-empty">
  <div class="board-hierarchy-empty-title">No hierarchy yet.</div>
  <div class="board-hierarchy-empty-detail">
    Connect this board to goals, initiatives, and teams.
  </div>
  <button type="button" class="board-hierarchy-cta">
    Create hierarchy
  </button>
</div>
```

## Examples
- `client/src/app/board/list/board-list.component.html`
- `client/src/app/board/board-view/board-cards-view/board-cards-view.component.html`
- `client/src/app/board/board-hierarchy-panel/board-hierarchy-panel.component.html`
- `client/src/app/board/card-panel/card-panel.component.html`

## Problem / Goal
Explain why a section is empty and guide the next action when there is no content to show.

## When to Use
- Use when a list or view has no data yet.
- Provide a CTA when creation is the next logical step.

## When Not to Use
- Do not use when data is still loading or an error occurred.
- Avoid CTA if the user cannot take action yet.

## Pros / Cons
- Pros: Reduces confusion, provides guidance.
- Cons: Can feel repetitive if overused; risks hiding empty context if too verbose.

## Alternatives / Related Patterns
- Onboarding prompts
- Inline guidance/tooltips

## External References
- Atlassian Design System Empty State: https://atlassian.design/components/empty-state
