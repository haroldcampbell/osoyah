# Boards API

## `GET /api/boards`

Returns board summaries used by the gallery.

Schema reference: response `backend/server/app/schemas/boards.py#BoardSummariesResponse` (boards[] -> BoardSummary).

Example request (curl):
```bash
curl -s http://localhost:9876/api/boards
```

Example response (truncated):
```json
{
  "boards": [
    {
      "id": "board-1",
      "guid": "8650e409-5f7e-48b2-9c6d-33bca57610c4",
      "title": "Product Roadmap",
      "createdAt": "2025-01-01T14:00:00.000Z"
    },
    {
      "id": "board-2",
      "guid": "195101f1-90c4-4e51-a7af-21643c0aadc6",
      "title": "Sales Pipeline",
      "createdAt": "2025-01-02T14:00:00.000Z"
    },
    "... truncated ..."
  ]
}
```

## `GET /api/boards/{boardId}`

Returns a board with lists and explicit card ordering.

Schema reference: response `backend/server/app/schemas/boards.py#Board`.

Example request (curl):
```bash
curl -s http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c
```

Example response:
```json
{
  "id": "board-eae664ad-4a31-401c-9a41-264824b7ec2c",
  "guid": "4592b910-406a-4108-96e6-2ca825c8f5dd",
  "title": "API Curl Board A Updated",
  "createdAt": "2026-01-16T23:25:12.425Z",
  "description": "Board A Updated",
  "pinned": true,
  "archived": false,
  "rollupsEnabled": true,
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

## `GET /api/boards/{boardId}/snapshot`

Returns a board snapshot with related collections for the board view.

Schema reference: response `backend/server/app/schemas/boards.py#BoardSnapshotResponse`.

Example request (curl):
```bash
curl -s http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c/snapshot
```

Example response (truncated):
```json
{
  "board": {
    "id": "board-eae664ad-4a31-401c-9a41-264824b7ec2c",
    "guid": "4592b910-406a-4108-96e6-2ca825c8f5dd",
    "title": "API Curl Board A Updated",
    "createdAt": "2026-01-16T23:25:12.425Z",
    "description": "Board A Updated",
    "pinned": true,
    "archived": false,
    "rollupsEnabled": true,
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
  },
  "cards": [
    {
      "id": "card-1",
      "guid": "fa1267c2-1637-4d70-b95e-d9b9fc23a9f2",
      "title": "Define MVP",
      "description": "Outline the minimum viable feature set.",
      "createdAt": "2025-01-01T14:00:00.000Z",
      "updatedAt": "2025-01-04T18:00:00.000Z",
      "comments": [
        {
          "id": "comment-6",
          "guid": "48b4a30e-4ba6-4858-a715-fd28cbb50b3e",
          "message": "This is blocked by the latest review.",
          "createdAt": "2025-01-03T14:00:00.000Z",
          "authorType": "user"
        }
      ],
      "status": {
        "state": "incomplete"
      }
    },
    "... truncated ..."
  ],
  "cardRelationships": [
    {
      "childCardId": "card-7",
      "parentCardId": "card-15",
      "createdAt": "2025-01-04T13:00:00.000Z"
    },
    "... truncated ..."
  ],
  "boardRelationships": [
    {
      "childBoardId": "board-3",
      "parentBoardId": "board-1",
      "createdAt": "2025-01-06T14:00:00.000Z"
    },
    "... truncated ..."
  ]
}
```

## `POST /api/boards`

Creates a board.

Schema reference: request `backend/server/app/schemas/boards.py#BoardCreateRequest`, response `backend/server/app/schemas/boards.py#Board`.

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/boards \\
  -H 'Content-Type: application/json' \\
  -d '{\"title\":\"API Curl Board A\",\"description\":\"Curl Board A\"}'
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
  "lists": []
}
```

## `PATCH /api/boards/{boardId}`

Updates board fields.

Schema reference: request `backend/server/app/schemas/boards.py#BoardUpdateRequest`, response `backend/server/app/schemas/boards.py#Board`.

Example request (curl):
```bash
curl -s -X PATCH http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c \\
  -H 'Content-Type: application/json' \\
  -d '{\"title\":\"API Curl Board A Updated\",\"description\":\"Board A Updated\",\"pinned\":true,\"archived\":false,\"rollupsEnabled\":true}'
```

Example response:
```json
{
  "id": "board-eae664ad-4a31-401c-9a41-264824b7ec2c",
  "guid": "4592b910-406a-4108-96e6-2ca825c8f5dd",
  "title": "API Curl Board A Updated",
  "createdAt": "2026-01-16T23:25:12.425Z",
  "description": "Board A Updated",
  "pinned": true,
  "archived": false,
  "rollupsEnabled": true,
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

## `DELETE /api/boards/{boardId}`

Hard-deletes a board and its lists.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c
```

Example response:
```json
{ "success": true }
```

## `PATCH /api/boards/{boardId}/list-order`

Reorders lists on a board.

Schema reference: request `backend/server/app/schemas/boards.py#ListOrderRequest`, response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X PATCH http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c/list-order \\
  -H 'Content-Type: application/json' \\
  -d '{\"listIds\":[\"list-13f4693b-77fa-490e-a71b-72dfce63f01e\",\"list-5f0de059-f82c-48fb-b4b3-f36deeef4fe4\"]}'
```

Example response:
```json
{ "success": true }
```
