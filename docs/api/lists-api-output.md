# Lists API

## `POST /api/boards/{boardId}/lists`

Creates a list on a board.

Schema reference: request `backend/server/app/schemas/boards.py#ListCreateRequest`, response `backend/server/app/schemas/boards.py#Board`.

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c/lists \
	-H 'Content-Type: application/json' \
	-d '{"title":"Backlog","isProcessDone":false}'
```

Example response:
```json
{
  "id": "board-eae664ad-4a31-401c-9a41-264824b7ec2c",
  "guid": "4592b910-406a-4108-96e6-2ca825c8f5dd",
  "title": "API Curl Board A",
  "createdAt": "2026-01-16T23:25:12.425Z",
  "description": "Curl Board A",
  "pinned": false,
  "archived": false,
  "rollupsEnabled": false,
  "lists": [
    {
      "id": "list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4",
      "guid": "08097fc4-5c12-488c-a7dd-cd4441196135",
      "title": "Backlog",
      "cardIds": [],
      "isProcessDone": false
    }
  ]
}
```

## `PATCH /api/lists/{listId}`

Updates a list.

Schema reference: request `backend/server/app/schemas/boards.py#ListUpdateRequest`, response `backend/server/app/schemas/boards.py#Board`.

Example request (curl):
```bash
curl -s -X PATCH http://localhost:9876/api/lists/list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4 \
	-H 'Content-Type: application/json' \
	-d '{"title":"Backlog Updated","isProcessDone":true}'
```

Example response:
```json
{
  "id": "board-eae664ad-4a31-401c-9a41-264824b7ec2c",
  "guid": "4592b910-406a-4108-96e6-2ca825c8f5dd",
  "title": "API Curl Board A",
  "createdAt": "2026-01-16T23:25:12.425Z",
  "description": "Curl Board A",
  "pinned": false,
  "archived": false,
  "rollupsEnabled": false,
  "lists": [
    {
      "id": "list-13f4693b-77fa-490e-a71b-72dfce63f01e",
      "guid": "a488bad6-d85e-411e-ac62-e16d76b03800",
      "title": "In Progress",
      "cardIds": [],
      "isProcessDone": false
    },
    {
      "id": "list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4",
      "guid": "08097fc4-5c12-488c-a7dd-cd4441196135",
      "title": "Backlog Updated",
      "cardIds": [
        "card-6865aace-0700-4107-acd0-723848c187ab",
        "card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6"
      ],
      "isProcessDone": true
    }
  ]
}
```

## `DELETE /api/lists/{listId}`

Hard-deletes a list.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/lists/list-13f4693b-77fa-490e-a71b-72dfce63f01e
```

Example response:
```json
{ "success": true }
```

## `PATCH /api/lists/{listId}/card-order`

Reorders cards on a list.

Schema reference: request `backend/server/app/schemas/boards.py#CardOrderRequest`, response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X PATCH http://localhost:9876/api/lists/list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4/card-order \
	-H 'Content-Type: application/json' \
	-d '{"cardIds":["card-6865aace-0700-4107-acd0-723848c187ab","card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6"]}'
```

Example response:
```json
{ "success": true }
```

## `POST /api/lists/{listId}/cards`

Adds an existing card to a list.

Schema reference: request `backend/server/app/schemas/boards.py#ListCardAttachRequest`, response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/lists/list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4/cards \
	-H 'Content-Type: application/json' \
	-d '{"cardId":"card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6"}'
```

Example response:
```json
{ "success": true }
```

## `DELETE /api/lists/{listId}/cards/{cardId}`

Removes a card from a list. If the card has no remaining list membership, it is
hard-deleted.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/lists/list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4/cards/card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6
```

Example response:
```json
{ "success": true }
```
