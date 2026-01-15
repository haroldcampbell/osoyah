import { expect, test, type Page } from '@playwright/test';
import {
	createBoardAndFetchId,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';
import { clickCardBackground } from './helpers';

// Spec: S002 Add Existing Card to Board

test('S002 adds an existing card to another board', async ({ page }) => {
	const suffix = randomSuffix();
	const sourceBoardTitle = `Attach source ${suffix}`;
	const targetBoardTitle = `Sales Pipeline ${suffix}`;
	const sourceListTitle = `Review ${suffix}`;
	const targetListTitle = `Attach Target ${suffix}`;
	let sourceBoardId = '';
	let targetBoardId = '';
	try {
		// Create isolated source/target boards and lists via the API so the UI has known entities.
		sourceBoardId = await createBoardAndFetchId(page.request, sourceBoardTitle);
		targetBoardId = await createBoardAndFetchId(page.request, targetBoardTitle);
		await createListAndFetchId(page.request, sourceBoardId, sourceListTitle);
		await createListAndFetchId(page.request, targetBoardId, targetListTitle);

		// Visit the target board once to ensure its lists are loaded into the client state.
		await primeBoard(page, targetBoardId, targetListTitle);
		await page.goto(`/boards/${sourceBoardId}`);
		await expect(page.locator('[data-testid="board"]')).toBeVisible();

		// Create a new card on the source board so there is an existing card to attach elsewhere.
		const reviewList = page.locator(
			`[data-testid="list"][data-list-title="${sourceListTitle}"]`,
		);
		const newCardTitle = `Attach card ${Date.now()}`;
		await reviewList.locator('[data-testid="add-card-input"]').fill(newCardTitle);
		await reviewList.locator('[data-testid="add-card-button"]').click();
		const targetCard = reviewList.locator('[data-testid="card"]', { hasText: newCardTitle });
		await expect(targetCard).toBeVisible();

		// Open the card panel for the newly created card.
		await clickCardBackground(page, targetCard);
		const panel = page.locator('[data-testid="card-panel"]');
		await expect(panel).toBeVisible();

		// Select the target board/list in the attach UI and confirm the current board cannot be reselected.
		const boardSelect = panel.locator('[data-testid="attach-board-select"]');
		const listSelect = panel.locator('[data-testid="attach-list-select"]');
		await expect(boardSelect).toBeVisible();
		await boardSelect.selectOption({ value: sourceBoardId });
		const attachButton = panel.locator('[data-testid="attach-board-button"]');
		await expect(attachButton).toBeDisabled();
		await expect(panel.locator('.card-panel-attach-status')).toContainText(
			'Card already on this board.',
		);
		await boardSelect.selectOption({ value: targetBoardId });
		await listSelect.selectOption({ label: targetListTitle });

		// Attach the card to the target board once the button becomes enabled.
		await expect(attachButton).toBeEnabled();
		await attachButton.click();

		// Verify the UI confirms the card was added to the chosen board/list.
		const status = panel.locator('[data-testid="attach-status"]');
		await expect(status).toBeVisible();
		await expect(status).toContainText(`Added to ${targetBoardTitle} / ${targetListTitle}.`);
	} finally {
		if (sourceBoardId) {
			await deleteBoard(page.request, sourceBoardId);
		}
		if (targetBoardId) {
			await deleteBoard(page.request, targetBoardId);
		}
	}
});

async function primeBoard(page: Page, boardId: string, listTitle: string): Promise<void> {
	await page.goto(`/boards/${boardId}`);
	await expect(page.locator(`[data-testid="list"][data-list-title="${listTitle}"]`)).toBeVisible();
}
