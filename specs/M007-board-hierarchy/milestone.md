# M007-Board Hierarchy: Project Tree View

Conform to `docs/principles.md`.

## Summary
Expose a hierarchy of boards in a left-side tree and a top breadcrumb bar for quick navigation.

## Goal
Let users navigate Goals > Initiatives > Teams > Tasks without introducing a new project entity.

## Scope
In-scope:
- Hierarchy link model for boards (metadata only).
- Left-side hierarchy panel and top breadcrumb bar.
- UI to manage board hierarchy links.
Out-of-scope:
- Roll-up metrics (handled in M008).
- New project entity or backend persistence.

## Specs
- [ ] S001-Board Hierarchy Model (Derived)
- [ ] S002-Hierarchy UI + Breadcrumbs
- [ ] S003-Hierarchy Management

## Notes
- Hierarchy lives in UI + metadata, not a new domain entity.
