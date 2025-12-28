# Architecture

## Data shapes (multi-board cards)

Cards are global entities shared across boards. Boards own list ordering and
membership by referencing card IDs. Card state (title, description, comments,
completion, owners, etc.) lives on the card and stays consistent across boards.

```json
{
  "cards": [
    {
      "id": "card-1",
      "title": "Define MVP",
      "description": "...",
      "createdAt": "2025-01-01T09:00:00Z",
      "updatedAt": "2025-01-04T13:00:00Z",
      "comments": [
        { "id": "comment-1", "message": "...", "createdAt": "2025-01-03T09:00:00Z" }
      ]
    }
  ],
  "boards": [
    {
      "id": "board-1",
      "title": "Product Roadmap",
      "lists": [
        {
          "id": "list-1",
          "title": "Backlog",
          "cardIds": ["card-1", "card-2"]
        }
      ]
    }
  ]
}
```

Rules:
- A card can appear on multiple boards, but only once per board.
- List ordering remains local to the board list via `cardIds`.
