# Endpoint Mapping: Relationships

Current relationship endpoints mapped to frontend usage and data needs. Keep this file updated when endpoints or data requirements change. See `docs/process.md` and `docs/guardrails-checklist.md`.

| Endpoint | Frontend usage | Data needs | Sources |
| --- | --- | --- | --- |
| `POST /api/cards/{parentCardId}/relationships` | `BoardService.addCardRelationship()` | Request: `childCardId`. Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/relationships.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/cards/{parentCardId}/relationships/{childCardId}` | `BoardService.unlinkParent()`, `BoardService.unlinkChild()` | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/relationships.py` |
| `POST /api/boards/{parentBoardId}/relationships` | `BoardService.setBoardParent()` | Request: `childBoardId`. Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/relationships.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/boards/{parentBoardId}/relationships/{childBoardId}` | `BoardService.setBoardParent()` | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/relationships.py` |
