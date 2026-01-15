import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createCardAndAttach,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: S004 Board Selection + CRUD

test('S004 switches boards with search-based selector', async ({ page }) => {
	const suffix = randomSuffix();
	const primaryTitle = `Product Roadmap ${suffix}`;
	const salesTitle = `Sales Pipeline ${suffix}`;
	const leadsTitle = `Leads ${suffix}`;
	let primaryBoardId = '';
	let salesBoardId = '';
	let leadCardId = '';
	try {
		primaryBoardId = await createBoardAndFetchId(page.request, primaryTitle);
		await createListAndFetchId(page.request, primaryBoardId, `Backlog ${suffix}`);

		salesBoardId = await createBoardAndFetchId(page.request, salesTitle);
		const leadsListId = await createListAndFetchId(page.request, salesBoardId, leadsTitle);
		leadCardId = await createCardAndAttach(page.request, leadsListId, 'Lead Alpha');

		await page.goto(`/boards/${primaryBoardId}`);
		await expect(page.locator('[data-testid="board"]')).toBeVisible();

		const selector = page.locator('[data-testid="board-selector"]');
		const menu = page.locator('[data-testid="board-menu"]');
		await selector.click();
		await expect(menu).toBeVisible();

		const searchInput = menu.locator('[data-testid="board-search-input"]');
		await searchInput.fill('No Match');
		await expect(menu.locator('[data-testid="board-search-empty"]')).toBeVisible();

		await searchInput.fill(suffix);
		const targetBoard = menu.locator(`[data-testid="board-option-${salesBoardId}"]`);
		await expect(targetBoard).toBeVisible();
		await targetBoard.click();

		await expect(page.locator('[data-testid="board-name"]')).toContainText(salesTitle);
		const leadsList = page.locator(`[data-testid="list"][data-list-title="${leadsTitle}"]`);
		await expect(
			leadsList.locator(`[data-testid="card"][data-card-id="${leadCardId}"]`),
		).toBeVisible();
	} finally {
		if (primaryBoardId) {
			await deleteBoard(page.request, primaryBoardId);
		}
		if (salesBoardId) {
			await deleteBoard(page.request, salesBoardId);
		}
	}
});

test('S004 creates, renames, and deletes boards with validation', async ({ page }) => {
	const suffix = randomSuffix();
	const boardTitle = `Board CRUD ${suffix}`;
	let boardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		await createListAndFetchId(page.request, boardId, `Backlog ${suffix}`);

		await page.goto(`/boards/${boardId}`);
		await expect(page.locator('[data-testid="board"]')).toBeVisible();

		const selector = page.locator('[data-testid="board-selector"]');
		await selector.click();
		const menu = page.locator('[data-testid="board-menu"]');
		const createInput = menu.locator('[data-testid="board-create-input"]');

		await createInput.fill('12');
		await menu.locator('[data-testid="board-create-button"]').click();
		await expect(menu.locator('[data-testid="board-create-error"]')).toContainText(
			'between 3 and 40 characters',
		);

		await createInput.fill('123');
		await menu.locator('[data-testid="board-create-button"]').click();
		await expect(menu.locator('[data-testid="board-create-error"]')).toContainText('all numbers');

		const createdTitle = `Launch Plan ${suffix}`;
		await createInput.fill(createdTitle);
		await menu.locator('[data-testid="board-create-button"]').click();
		await expect(page).toHaveURL(/\/boards\/[^/]+/);
		await expect(page.locator('[data-testid="board-name"]')).toContainText(createdTitle);

		const settingsToggle = page.locator('[data-testid="board-settings-toggle"]');
		await settingsToggle.click();
		const settings = page.locator('[data-testid="board-settings"]');
		await expect(settings).toBeVisible();

		const updatedTitle = `Launch Roadmap ${suffix}`;
		const settingsTitle = settings.locator('[data-testid="board-settings-title"]');
		await settingsTitle.fill(updatedTitle);
		await settings.locator('[data-testid="board-settings-save"]').click();
		await expect(settings).toHaveCount(0);
		await expect(page.locator('[data-testid="board-name"]')).toContainText(updatedTitle);

		await settingsToggle.click();
		const reopenedSettings = page.locator('[data-testid="board-settings"]');
		await expect(reopenedSettings).toBeVisible();
		page.once('dialog', (dialog) => dialog.accept());
		await reopenedSettings.locator('[data-testid="board-settings-delete"]').click();
		await expect(page.locator('[data-testid="board-name"]')).not.toContainText(updatedTitle);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
