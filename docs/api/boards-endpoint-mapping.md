# Endpoint Mapping: Boards

Current board endpoints mapped to frontend usage and data needs. Keep this file updated when endpoints or data requirements change. See `docs/process.md` and `docs/guardrails-checklist.md`.

| Endpoint | Frontend usage | Data needs | Sources |
| --- | --- | --- | --- |
| `GET /api/boards` | `BoardService.getBoardSummaries()` | Response: `BoardSummary[]` (`id`, `title`, `createdAt`, `description?`, `rollupsEnabled?`, `pinned?`, `archived?`). | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `GET /api/boards/{boardId}` | `BoardService.getBoardDetails()` | Response: `Board` (`id`, `title`, `createdAt`, `description?`, `rollupsEnabled?`, `pinned?`, `archived?`, `lists[]`). | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `GET /api/boards/{boardId}/snapshot` | `BoardService.getBoardSnapshot()` | Response: `BoardSnapshotResponse` (`board`, `cards[]`, `cardRelationships[]`, `boardRelationships[]`) with list `cardIds` order preserved. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `POST /api/boards` | `BoardService.createBoard()` | Request: `title`, `description`. Response: `Board`. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `PATCH /api/boards/{boardId}` | `BoardService.updateBoardSettings()`, `BoardService.syncBoardFlags()` (called by `pinBoard()`, `unpinBoard()`, `archiveBoard()`, `restoreBoard()`) | Request: `title`, `description`, `pinned`, `archived`, `rollupsEnabled`. Response: `Board`. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/boards/{boardId}` | `BoardService.deleteBoard()` | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py` |
| `PATCH /api/boards/{boardId}/list-order` | `BoardService.reorderLists()` | Request: `listIds[]` in display order. Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
