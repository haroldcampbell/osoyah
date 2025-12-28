import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S003 Membership Indicators + Navigation

test('S003 shows memberships and navigates between boards', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

	const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
	const card = backlogList.locator('[data-testid="card"][data-card-id="card-1"]');
	await expect(card).toBeVisible();

	await clickCardBackground(page, card);
	const panel = page.locator('[data-testid="card-panel"]');
	await expect(panel).toBeVisible();

	const membershipList = panel.locator('[data-testid="membership-list"]');
	await expect(membershipList).toBeVisible();

	const currentBoard = membershipList.locator(
		'[data-testid="membership-board"][data-board-id="board-1"]',
	);
	await expect(currentBoard).toBeDisabled();
	await expect(currentBoard).toContainText('Current');

	const targetBoard = membershipList.locator(
		'[data-testid="membership-board"][data-board-id="board-2"]',
	);
	await expect(targetBoard).toBeEnabled();
	await targetBoard.click();

	await expect(page.locator('[data-testid="board-name"]')).toContainText('Sales Pipeline');
	await expect(panel).toBeVisible();

	const leadsList = page.locator('[data-testid="list"][data-list-title="Leads"]');
	await expect(
		leadsList.locator('[data-testid="card"][data-card-id="card-1"]'),
	).toBeVisible();
});
