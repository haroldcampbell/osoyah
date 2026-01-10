# 01-001 Toasts (Success + Error)

## Guidance
- Use self-dismissing toasts for state-changing actions.
- Place toasts in the top-right to avoid blocking primary actions.
- Keep copy short and specific; use past tense on success and clear remediation on failure.
- Duration: 2.0 to 3.0 seconds; errors may stay slightly longer but must auto-dismiss.

## Snippet
```html
<div class="board-toast-wrap" data-testid="board-settings-toast">
  <div class="board-toast" [class.is-error]="boardSettingsToastError">
    {{ boardSettingsToastMessage }}
  </div>
</div>
```

## Example
- `client/src/app/board/board.component.html`

## Problem / Goal
Provide lightweight, non-blocking feedback for state changes without interrupting the user flow.

## When to Use
- Use for successful or failed actions that do not require immediate user input.
- Use when feedback should auto-dismiss and not block navigation.

## When Not to Use
- Do not use for destructive confirmations or decisions that require a user choice.
- Avoid for critical errors that must be acknowledged or fixed immediately.

## Pros / Cons
- Pros: Lightweight, low interruption, easy to scan.
- Cons: Easy to miss, accessibility requires live-region handling.

## Alternatives / Related Patterns
- Inline status messages
- Alerts/banners
- Modal dialogs for blocking errors

## External References
- Material Design Snackbar: https://m3.material.io/components/snackbar/overview
- WAI-ARIA Alert pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
