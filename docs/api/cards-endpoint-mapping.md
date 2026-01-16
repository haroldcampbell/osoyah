# Endpoint Mapping: Cards

Current card endpoints mapped to frontend usage and data needs. Keep this file updated when endpoints or data requirements change. See `docs/process.md` and `docs/guardrails-checklist.md`.

| Endpoint | Frontend usage | Data needs | Sources |
| --- | --- | --- | --- |
| `POST /api/cards` | `BoardService.addCard()` | Request: `title`, `description`. Response: `Card`. | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `PATCH /api/cards/{cardId}` | `BoardService.saveCardEdit()`, `BoardService.saveCardDescription()`, `BoardService.setCardStatus()` | Request: `title`, `description`, `statusState`, `completedAt`. Response: `Card` (`comments[]`, `status`, `updatedAt` used). | `client/src/app/services/board.service.ts`, `client/src/app/models/board.model.ts`, `backend/server/app/api/routes/boards.py`, `backend/server/app/schemas/boards.py` |
| `DELETE /api/cards/{cardId}` | `BoardService.removeCard()` (when orphaned) | Response: `{ success: true }`. | `client/src/app/services/board.service.ts`, `backend/server/app/api/routes/boards.py` |
