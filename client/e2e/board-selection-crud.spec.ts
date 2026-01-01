import { expect, test } from '@playwright/test';

// Spec: S004 Board Selection + CRUD

test('S004 switches boards with search-based selector', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

	const selector = page.locator('[data-testid="board-selector"]');
	const menu = page.locator('[data-testid="board-menu"]');
	await selector.click();
	await expect(menu).toBeVisible();

	const searchInput = menu.locator('[data-testid="board-search-input"]');
	await searchInput.fill('No Match');
	await expect(menu.locator('[data-testid="board-search-empty"]')).toBeVisible();

	await searchInput.fill('Sales');
	const targetBoard = menu.locator('[data-testid="board-option-board-2"]');
	await expect(targetBoard).toBeVisible();
	await targetBoard.click();

	await expect(page.locator('[data-testid="board-name"]')).toContainText('Sales Pipeline');
	const leadsList = page.locator('[data-testid="list"][data-list-title="Leads"]');
	await expect(leadsList.locator('[data-testid="card"][data-card-id="card-1"]')).toBeVisible();
});

test('S004 creates, renames, and deletes boards with validation', async ({ page }) => {
	await page.goto('/');
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
	await expect(menu.locator('[data-testid="board-create-error"]')).toContainText(
		'all numbers',
	);

	await createInput.fill('Launch Plan');
	await menu.locator('[data-testid="board-create-button"]').click();
	await expect(page).toHaveURL(/\/boards\/[^/]+/);
	await expect(page.locator('[data-testid="board-name"]')).toContainText('Launch Plan');

	const settingsToggle = page.locator('[data-testid="board-settings-toggle"]');
	await settingsToggle.click();
	const settings = page.locator('[data-testid="board-settings"]');
	await expect(settings).toBeVisible();

	const settingsTitle = settings.locator('[data-testid="board-settings-title"]');
	await settingsTitle.fill('Launch Roadmap');
	await settings.locator('[data-testid="board-settings-save"]').click();
	await expect(page.locator('[data-testid="board-name"]')).toContainText('Launch Roadmap');

	page.once('dialog', (dialog) => dialog.accept());
	await settings.locator('[data-testid="board-settings-delete"]').click();
	await expect(page.locator('[data-testid="board-name"]')).not.toContainText('Launch Roadmap');
});
