# Boards API

Base path: `/api`

All error responses use this shape:
```json
{
  "error": {
    "code": "not_found",
    "message": "Board not found.",
    "details": {}
  }
}
```

## `GET /api/boards`

Returns board summaries used by the gallery.

Response:
```json
{
  "boards": [
    {
      "id": "board-1",
      "guid": "9b9c77d0-9203-4d8c-8c1f-0afaa6f647b1",
      "title": "Product Roadmap",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "description": "Quarterly planning board",
      "pinned": true,
      "archived": false,
      "rollupsEnabled": true
    }
  ]
}
```

## `GET /api/boards/{boardId}`

Returns a board with lists and explicit card ordering.

Response:
```json
{
  "id": "board-1",
  "guid": "9b9c77d0-9203-4d8c-8c1f-0afaa6f647b1",
  "title": "Product Roadmap",
  "createdAt": "2026-01-01T12:00:00.000Z",
  "description": "Quarterly planning board",
  "pinned": true,
  "archived": false,
  "rollupsEnabled": true,
  "lists": [
    {
      "id": "list-1",
      "guid": "6f6d68fb-27f4-476a-9f08-ec39b9c6018e",
      "title": "Backlog",
      "cardIds": ["card-1", "card-2"],
      "isProcessDone": false
    }
  ]
}
```

## `GET /api/boards/{boardId}/snapshot`

Returns a board snapshot with related collections for the board view.

Response:
```json
{
  "board": {
    "id": "board-1",
    "guid": "9b9c77d0-9203-4d8c-8c1f-0afaa6f647b1",
    "title": "Product Roadmap",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "description": "Quarterly planning board",
    "pinned": true,
    "archived": false,
    "rollupsEnabled": true,
    "lists": [
      {
        "id": "list-1",
        "guid": "6f6d68fb-27f4-476a-9f08-ec39b9c6018e",
        "title": "Backlog",
        "cardIds": ["card-1", "card-2"],
        "isProcessDone": false
      }
    ]
  },
  "cards": [
    {
      "id": "card-1",
      "guid": "5f8f1a6d-8b6b-4685-8dd8-7b4b9900d2f7",
      "title": "Review onboarding",
      "description": "Audit the onboarding flow",
      "createdAt": "2026-01-01T12:05:00.000Z",
      "updatedAt": "2026-01-01T13:00:00.000Z",
      "comments": [
        {
          "id": "comment-1",
          "guid": "e7cb567c-7f2d-4da8-8944-21f586e6b8f6",
          "message": "Initial draft ready.",
          "createdAt": "2026-01-01T12:06:00.000Z",
          "authorType": "user"
        }
      ],
      "status": {
        "state": "incomplete",
        "completedAt": null
      }
    }
  ],
  "cardRelationships": [
    {
      "childCardId": "card-2",
      "parentCardId": "card-1",
      "createdAt": "2026-01-01T12:10:00.000Z"
    }
  ],
  "boardRelationships": [
    {
      "childBoardId": "board-2",
      "parentBoardId": "board-1",
      "createdAt": "2026-01-01T12:12:00.000Z"
    }
  ]
}
```

## `POST /api/boards`

Creates a board.

Request:
```json
{
  "title": "New Board",
  "description": "Optional description"
}
```

Response: `Board` (same shape as `GET /api/boards/{boardId}`).

## `PATCH /api/boards/{boardId}`

Updates board fields.

Request:
```json
{
  "title": "Updated Board",
  "description": "Updated description",
  "pinned": true,
  "archived": false,
  "rollupsEnabled": true
}
```

Response: `Board`.

## `DELETE /api/boards/{boardId}`

Hard-deletes a board and its lists.

Response:
```json
{ "success": true }
```

## `PATCH /api/boards/{boardId}/list-order`

Reorders lists on a board.

Request:
```json
{
  "listIds": ["list-2", "list-1"]
}
```

Response:
```json
{ "success": true }
```

## `POST /api/boards/{boardId}/lists`

Creates a list on a board.

Request:
```json
{
  "title": "Backlog",
  "isProcessDone": false
}
```

Response: `Board`.

## `PATCH /api/lists/{listId}`

Updates a list.

Request:
```json
{
  "title": "In Progress",
  "isProcessDone": false
}
```

Response: `Board`.

## `DELETE /api/lists/{listId}`

Hard-deletes a list.

Response:
```json
{ "success": true }
```

## `PATCH /api/lists/{listId}/card-order`

Reorders cards on a list.

Request:
```json
{
  "cardIds": ["card-2", "card-1"]
}
```

Response:
```json
{ "success": true }
```

## `POST /api/cards`

Creates a card.

Request:
```json
{
  "title": "New Card",
  "description": "Optional details"
}
```

Response: `Card`.

## `PATCH /api/cards/{cardId}`

Updates a card.

Request:
```json
{
  "title": "Updated Card",
  "description": "Updated details",
  "statusState": "completed",
  "completedAt": "2026-01-01T12:00:00.000Z"
}
```

Response: `Card`.

## `DELETE /api/cards/{cardId}`

Hard-deletes a card.

Response:
```json
{ "success": true }
```

## `POST /api/lists/{listId}/cards`

Adds an existing card to a list.

Request:
```json
{
  "cardId": "card-1"
}
```

Response:
```json
{ "success": true }
```

## `DELETE /api/lists/{listId}/cards/{cardId}`

Removes a card from a list. If the card has no remaining list membership, it is
hard-deleted.

Response:
```json
{ "success": true }
```
