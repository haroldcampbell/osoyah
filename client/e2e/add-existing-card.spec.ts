import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S002 Add Existing Card to Board

test('S002 adds an existing card to another board', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

	const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
	const targetCard = reviewList.locator('[data-testid="card"][data-card-id="card-6"]');
	await expect(targetCard).toBeVisible();

	await clickCardBackground(page, targetCard);
	const panel = page.locator('[data-testid="card-panel"]');
	await expect(panel).toBeVisible();

	const boardSelect = panel.locator('[data-testid="attach-board-select"]');
	const listSelect = panel.locator('[data-testid="attach-list-select"]');
	await expect(boardSelect).toBeVisible();
	await boardSelect.selectOption({ value: 'board-1' });
	const attachButton = panel.locator('[data-testid="attach-board-button"]');
	await expect(attachButton).toBeDisabled();
	await expect(panel.locator('.card-panel-attach-status')).toContainText('Card already on this board.');
	await boardSelect.selectOption({ value: 'board-2' });
	await expect(listSelect).toHaveValue('list-8');

	await expect(attachButton).toBeEnabled();
	await attachButton.click();

	const status = panel.locator('[data-testid="attach-status"]');
	await expect(status).toBeVisible();
	await expect(status).toContainText('Added to Sales Pipeline / Leads.');
});
