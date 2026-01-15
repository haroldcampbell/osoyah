import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createCardAndAttach,
	createCardRelationship,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: S002 Board View Modes (List)

test('S002 toggles list view, expands rows, and opens card panel from list', async ({ page }) => {
	const suffix = randomSuffix();
	const backlogTitle = `Backlog ${suffix}`;
	const boardTitle = `List view ${suffix}`;
	let boardId = '';
	let parentCardId = '';
	let childOneId = '';
	let childTwoId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
		parentCardId = await createCardAndAttach(page.request, backlogListId, 'Parent card');
		childOneId = await createCardAndAttach(page.request, backlogListId, 'Child one');
		childTwoId = await createCardAndAttach(page.request, backlogListId, 'Child two');
		await createCardRelationship(page.request, parentCardId, childOneId);
		await createCardRelationship(page.request, parentCardId, childTwoId);

		await page.goto(`/boards/${boardId}`);

		await expect(page.locator('[data-testid="board"]')).toBeVisible();
		await page.locator('[data-testid="view-list"]').click();
		await expect(page.locator('[data-testid="list-view"]')).toBeVisible();

		const parentRow = page.locator(
			`[data-testid="list-view-row"][data-card-id="${parentCardId}"]`,
		);
		await expect(parentRow).toBeVisible();
		await parentRow.locator('[data-testid="list-view-toggle"]').click();

		const detailPanel = page.locator(`#list-view-detail-${parentCardId}`);
		await expect(detailPanel).toBeVisible();
		await expect(detailPanel.locator(`[data-card-id="${childOneId}"]`)).toBeVisible();
		await expect(detailPanel.locator(`[data-card-id="${childTwoId}"]`)).toBeVisible();

		await parentRow.locator('[data-testid="list-view-title"]').click();
		await expect(page).toHaveURL(new RegExp(`/boards/${boardId}/cards/${parentCardId}`));
		const cardPanel = page.locator('[data-testid="card-panel"]');
		await expect(cardPanel).toBeVisible();
		await cardPanel.getByRole('button', { name: 'Close' }).click();
		await expect(cardPanel).toHaveCount(0);

		await page.locator('[data-testid="view-cards"]').click();
		await expect(page.locator('[data-testid="list-view"]')).toHaveCount(0);
		await expect(page.locator('[data-testid="list"]')).toHaveCount(1);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}

	const salesTitle = `List view sales ${suffix}`;
	let salesBoardId = '';
	try {
		salesBoardId = await createBoardAndFetchId(page.request, salesTitle);
		await createListAndFetchId(page.request, salesBoardId, `Leads ${suffix}`);
		await createListAndFetchId(page.request, salesBoardId, `Discovery ${suffix}`);
		await createListAndFetchId(page.request, salesBoardId, `Negotiation ${suffix}`);
		await createListAndFetchId(page.request, salesBoardId, `Closed ${suffix}`);

		await page.goto(`/boards/${salesBoardId}`);
		await expect(page.locator('[data-testid="list-view"]')).toHaveCount(0);
		await expect(page.locator('[data-testid="list"]')).toHaveCount(4);
	} finally {
		if (salesBoardId) {
			await deleteBoard(page.request, salesBoardId);
		}
	}
});
