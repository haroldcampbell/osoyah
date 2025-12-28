# 05 Testing + Troubleshooting

Commands
- `npm run lint`
- `npm run format:check`
- `npm run e2e`

Logs
- `client/logs/e2e.log`
- `client/logs/test.log`
- `client/logs/playwright-report/`

E2E hang tips
- Wait for the board to be visible before interactions.
- Prefer `data-testid` locators.
- Scroll elements into view before clicking.
- Avoid `boundingBox()` after elements are replaced.
- Run a single spec to isolate a hang.
