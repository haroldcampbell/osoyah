# Endpoint Mapping: Lists

Current list endpoints mapped to frontend usage and data needs. Keep this file updated when endpoints or data requirements change. See `docs/process.md` and `docs/guardrails-checklist.md`.

| Endpoint | Frontend usage | Data needs | Sources |
| --- | --- | --- | --- |
| `POST /api/boards/{boardId}/lists` | `BoardService.createBoard()` (default list), `BoardService.addList()` | Request: `title`, `isProcessDone`. Response: `Board`. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `PATCH /api/lists/{listId}` | `BoardService.saveListEdit()`, `BoardService.setListProcessDone()` | Request: `title` and/or `isProcessDone`. Response: `Board`. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/lists/{listId}` | `BoardService.removeList()` | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py` |
| `PATCH /api/lists/{listId}/card-order` | `BoardService.reorderCards()` | Request: `cardIds[]` in list order. Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `POST /api/lists/{listId}/cards` | `BoardService.attachCardToList()`, `BoardService.addCard()` (attach step), `BoardService.moveCard()` | Request: `cardId`. Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/lists/{listId}/cards/{cardId}` | `BoardService.removeCard()`, `BoardService.moveCard()` | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py` |
