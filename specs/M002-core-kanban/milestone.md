# M002-Core Kanban: Basic board interactions

Conform to `principles.md`.

## Summary
Deliver a usable Kanban board UI with core list/card interactions and drag-and-drop.

## Goal
Provide a basic, interactive board that supports common Kanban workflows without backend persistence.

## Scope
In-scope:
- Board view that renders lists and cards from mock data.
- Create, rename, and remove lists.
- Create, edit, and remove cards.
- Drag-and-drop to reorder lists and move cards within/between lists.
- Basic empty and loading states.
- Unit test coverage for core UI behaviors.
- E2E coverage for primary board flows.
Out-of-scope:
- Auth, multi-user collaboration, or permissions.
- Server-side persistence or API integration beyond mock data.
- Due dates, labels, swimlanes, or advanced filtering.

## Specs
- S001-Board Flow
- S002-Drag and Drop
- S003-List Management
- S004-Card Management
- S005-Testing

## Notes

## Not yet

- User accounts or auth flows.
- Realtime collaboration or presence.
- Labels, due dates, or attachments.
- Filters, search, or saved views.
- Swimlanes, WIP limits, or analytics.
