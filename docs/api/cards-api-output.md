# Cards API

## `POST /api/cards`

Creates a card.

Schema reference: request `backend/server/app/schemas/boards.py#CardCreateRequest`, response `backend/server/app/schemas/boards.py#Card`.

Example request (curl):
```bash
curl -s -X POST http://localhost:9876/api/cards \
	-H 'Content-Type: application/json' \
	-d '{"title":"API Curl Card 1","description":"Card 1"}'
```

Example response:
```json
{
  "id": "card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6",
  "guid": "2f251b0d-d2fe-484c-9fa5-e4d44ead65da",
  "title": "API Curl Card 1",
  "description": "Card 1",
  "createdAt": "2026-01-16T23:25:12.492Z",
  "updatedAt": "2026-01-16T23:25:12.492Z",
  "comments": [],
  "status": {
    "state": "incomplete"
  }
}
```

## `PATCH /api/cards/{cardId}`

Updates a card.

Schema reference: request `backend/server/app/schemas/boards.py#CardUpdateRequest`, response `backend/server/app/schemas/boards.py#Card`.

Example request (curl):
```bash
curl -s -X PATCH http://localhost:9876/api/cards/card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6 \
	-H 'Content-Type: application/json' \
	-d '{"title":"API Curl Card 1 Updated","description":"Updated description","statusState":"completed","completedAt":"2026-01-01T12:00:00.000Z"}'
```

Example response:
```json
{
  "id": "card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6",
  "guid": "2f251b0d-d2fe-484c-9fa5-e4d44ead65da",
  "title": "API Curl Card 1 Updated",
  "description": "Updated description",
  "createdAt": "2026-01-16T23:25:12.492Z",
  "updatedAt": "2026-01-16T23:25:12.549Z",
  "comments": [],
  "status": {
    "state": "completed",
    "completedAt": "2026-01-01T17:00:00.000Z"
  }
}
```

## `DELETE /api/cards/{cardId}`

Hard-deletes a card.

Schema reference: response is `{ "success": true }` (no schema class).

Example request (curl):
```bash
curl -s -X DELETE http://localhost:9876/api/cards/card-c7c37f03-ad52-4c11-b7b5-f8d6135e47f6
```

Example response:
```json
{ "success": true }
```
