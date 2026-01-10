# 01-005 Inline Validation + Errors

## Guidance
- Show error text directly under the relevant field or section.
- Keep copy short and actionable.

## Snippet
```html
@if (titleError) {
  <div class="card-title-error" data-testid="card-title-error">
    {{ titleError }}
  </div>
}
```

## Examples
- `client/src/app/board/list/board-list.component.html`
- `client/src/app/board/card/board-card.component.html`
- `client/src/app/board/board-toolbar/board-toolbar.component.html`

## Problem / Goal
Provide immediate, localized feedback on user input errors without breaking flow.

## When to Use
- Use for form or field-level validation and submission errors.
- Place errors directly under the related control.

## When Not to Use
- Avoid inline-only errors for multi-field failures; include a summary if needed.
- Do not use for global system outages.

## Pros / Cons
- Pros: Clear association between error and field; fast to resolve.
- Cons: Can clutter dense forms; may be missed if layout shifts.

## Alternatives / Related Patterns
- Error summary at top of form
- Toast + inline detail

## External References
- WCAG 2.1 Understanding Error Identification: https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
- Nielsen Norman Group Error Message Guidelines: https://www.nngroup.com/articles/error-message-guidelines/
