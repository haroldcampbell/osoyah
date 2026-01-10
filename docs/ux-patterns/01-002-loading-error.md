# 01-002 Loading + Error States

## Guidance
- Loading text appears inline within the main content area, not as an overlay.
- Error text is displayed inline with a distinct error style.

## Snippet
```html
@if (boardService.loading) {
  <div class="board-state">Loading board...</div>
}
@if (boardService.error) {
  <div class="board-state error">{{ boardService.error }}</div>
}
```

## Examples
- `client/src/app/board/board.component.html`
- `client/src/app/board-gallery/board-gallery.component.html`

## Problem / Goal
Communicate system state (loading or failure) without blocking the user or hiding the page context.

## When to Use
- Use inline loading/error states for page-level fetches or section-level data loads.
- Use when the user can still orient themselves in the UI while waiting.

## When Not to Use
- Avoid inline loading if the action is blocking or requires immediate attention; use a modal or full-screen blocker instead.
- Avoid showing error states when data is simply empty; use empty states instead.

## Pros / Cons
- Pros: Clear state, minimal layout disruption.
- Cons: Provides little progress feedback; can feel static for long tasks.

## Alternatives / Related Patterns
- Skeleton loading
- Progress indicators
- Toasts for transient errors

## External References
- Material Design Progress Indicators: https://m3.material.io/components/progress-indicators/overview
- Nielsen Norman Group Error Message Guidelines: https://www.nngroup.com/articles/error-message-guidelines/
