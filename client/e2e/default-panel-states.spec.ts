import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: M008-S003

test('M008-S003 defaults hierarchy closed and roll-up metrics off', async ({ page }) => {
	const suffix = randomSuffix();
	const boardTitle = `Hierarchy defaults ${suffix}`;
	const listTitle = `Backlog ${suffix}`;
	let boardId = '';
	try {
		// Create an isolated board + list via the API and open it to load the board state in the UI.
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		await createListAndFetchId(page.request, boardId, listTitle);
		await page.goto(`/boards/${boardId}`);

		// Verify the hierarchy panel is collapsed by default (not rendered).
		const hierarchyPanel = page.locator('[data-testid="hierarchy-panel"]');
		await expect(hierarchyPanel).toHaveCount(0);

		// Expand the hierarchy panel using the toggle and confirm it becomes visible.
		const hierarchyToggle = page.locator('[data-testid="hierarchy-toggle"]');
		await expect(hierarchyToggle).toHaveAttribute('aria-expanded', 'false');
		await hierarchyToggle.click();
		await expect(hierarchyPanel).toBeVisible();

		// Rollup metrics should be hidden before enabling them in settings.
		const rollups = page.locator('[data-testid="hierarchy-rollups"]');
		await expect(rollups).toHaveCount(0);

		// Open board settings so we can change the rollups configuration.
		const settingsToggle = page.locator('[data-testid="board-settings-toggle"]');
		await settingsToggle.click();
		const settings = page.locator('[data-testid="board-settings"]');
		await expect(settings).toBeVisible();

		// Enable rollups, save the settings, and confirm the panel closes.
		const rollupsToggle = settings.locator('[data-testid="board-settings-rollups"]');
		await expect(rollupsToggle).not.toBeChecked();
		await rollupsToggle.check();
		await settings.locator('[data-testid="board-settings-save"]').click();
		await expect(settings).toHaveCount(0);

		// Confirm rollup UI appears and defaults to the "Direct" scope.
		await expect(rollups).toBeVisible();
		await expect(rollups.getByRole('button', { name: 'Direct' })).toHaveClass(/active/);

		// Reopen settings, disable rollups, and verify the rollup UI is hidden again.
		await settingsToggle.click();
		const reopenedSettings = page.locator('[data-testid="board-settings"]');
		await expect(reopenedSettings).toBeVisible();
		const reopenedRollupsToggle = reopenedSettings.locator('[data-testid="board-settings-rollups"]');
		await reopenedRollupsToggle.uncheck();
		await reopenedSettings.locator('[data-testid="board-settings-save"]').click();
		await expect(reopenedSettings).toHaveCount(0);
		await expect(rollups).toHaveCount(0);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
