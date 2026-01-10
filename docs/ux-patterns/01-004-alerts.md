# 01-004 Alerts (Not Found + Warnings)

## Guidance
- Use a prominent alert block with title + detail line.
- Offer direct recovery actions when possible.

## Snippet
```html
<div class="board-alert board-alert-plain error" data-testid="board-not-found">
  <h2 class="board-alert-title board-alert-title-large">Board not found.</h2>
  <div class="board-alert-detail">The board ID "{{ missingBoardId }}" does not exist.</div>
</div>
```

## Examples
- `client/src/app/board/board.component.html`

## Problem / Goal
Surface critical or exceptional states that require user attention and possible action.

## When to Use
- Use for not-found states or warnings that block the user’s current intent.
- Provide a recovery action when possible.

## When Not to Use
- Avoid for minor feedback that can be handled by inline text or toasts.
- Do not use for transient status updates.

## Pros / Cons
- Pros: High visibility, clear signal of severity.
- Cons: Can feel intrusive or repetitive if overused.

## Alternatives / Related Patterns
- Toasts or inline errors for lower severity
- Modal dialogs for confirmations

## External References
- WAI-ARIA Alert pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- WAI-ARIA Alert Dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
