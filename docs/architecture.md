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
			"status": { "state": "incomplete", "completedAt": null },
			"comments": [{ "id": "comment-1", "message": "...", "createdAt": "2025-01-03T09:00:00Z" }]
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
					"cardIds": ["card-1", "card-2"],
					"isProcessDone": false
				}
			]
		}
	]
}
```

Rules:

-   A card can appear on multiple boards, but only once per board.
-   List ordering remains local to the board list via `cardIds`.
-   Lists can be flagged with `isProcessDone` to represent completion stages.
-   Moving a card into a done list marks its `status` as completed and sets `completedAt`.

## Roll-up metrics (board + descendants)

Roll-up metrics are derived from board membership (lists) and descendant boards, not solely from card relationships. Metrics are generated from a configuration definition (e.g., total cards, completed cards) so the aggregation logic can be extended without changing the UI.

Example configuration:

```json
[
	{
		"rollupName": "Card count",
		"rollupFunction": "count",
		"targetProperty": "board.cards"
	},
	{
		"rollupName": "Cards done",
		"rollupFunction": "count",
		"targetProperty": "board.cards",
		"propertyFilter": "card.status.state == completed"
	}
]
```
