# Relationships API

## `POST /api/cards/{parentCardId}/relationships`

Creates a parent/child card relationship.

Schema reference: request `backend/server/app/schemas/boards.py#CardRelationshipCreateRequest`, response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/cards/card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6/relationships \
  -H 'Content-Type: application/json' \
  -d '{"childCardId":"card-6865aace-0700-4107-acd0-723848c187ab"}'
```

Example response:
```json
{ "success": true }
```

## `DELETE /api/cards/{parentCardId}/relationships/{childCardId}`

Removes a parent/child card relationship.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/cards/card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6/relationships/card-6865aace-0700-4107-acd0-723848c187ab
```

Example response:
```json
{ "success": true }
```

## `POST /api/boards/{parentBoardId}/relationships`

Creates a parent/child board relationship.

Schema reference: request `backend/server/app/schemas/boards.py#BoardRelationshipCreateRequest`, response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c/relationships \
  -H 'Content-Type: application/json' \
  -d '{"childBoardId":"board-388de4da-c096-4fd6-8ce2-572197f8f046"}'
```

Example response:
```json
{ "success": true }
```

## `DELETE /api/boards/{parentBoardId}/relationships/{childBoardId}`

Removes a parent/child board relationship.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/boards/board-eae664ad-4a31-401c-9a41-264824b7ec2c/relationships/board-388de4da-c096-4fd6-8ce2-572197f8f046
```

Example response:
```json
{ "success": true }
```
