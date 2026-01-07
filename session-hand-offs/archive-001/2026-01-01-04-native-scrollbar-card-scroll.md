# 2026-01-01-04-native-scrollbar-card-scroll

## Summary
- Removed the detached board scrollbar and moved horizontal scrolling to the lists container.
- Updated selected-card scroll logic to compute horizontal scroll within `.lists`, respecting the card panel overlap.
- Adjusted board layout flex behavior to keep the native scrollbar at the bottom of the viewport.

## Work Completed
- Dropped the `.board-scrollbar` element and related sync logic in `board.component`.
- Switched card selection scrolling to direct `scrollLeft` math on the lists container.
- Made board shell/layout stretch to keep the lists scrollbar at the viewport bottom.

## Decisions
- Use the lists container as the single scroll surface for horizontal board navigation.

## Open Questions
- None.

## Outstanding
- User to run `npm run lint` and `npm run format:check` externally with logs in `client/logs/`.

## Next Steps
- Confirm card visibility behavior after panel opens and route-based selection.
