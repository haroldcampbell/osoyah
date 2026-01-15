import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createCardAndAttach,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';
import { clickCardBackground } from './helpers';

// Spec: S005 Card Density Layout

test('S005 shows metadata and description indicator on cards', async ({ page }) => {
	const suffix = randomSuffix();
	const boardTitle = `Card density ${suffix}`;
	const backlogTitle = `Backlog ${suffix}`;
	const reviewTitle = `Review ${suffix}`;
	let boardId = '';
	let primaryCardId = '';
	let describedCardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
		const reviewListId = await createListAndFetchId(page.request, boardId, reviewTitle);
		primaryCardId = await createCardAndAttach(page.request, backlogListId, 'Primary card');
		describedCardId = await createCardAndAttach(
			page.request,
			reviewListId,
			'Described card',
			'Card description.',
		);

		await page.goto(`/boards/${boardId}`);

		const backlogList = page.locator(
			`[data-testid="list"][data-list-title="${backlogTitle}"]`,
		);
		const card = backlogList.locator(
			`[data-testid="card"][data-card-id="${primaryCardId}"]`,
		);
		await expect(card).toBeVisible();

		await clickCardBackground(page, card);
		const panel = page.locator('[data-testid="card-panel"]');
		await expect(panel).toBeVisible();
		const commentInput = panel.locator('#card-panel-comment');
		for (let i = 0; i < 5; i += 1) {
			await commentInput.fill(`Comment ${i + 1}`);
			await panel.getByRole('button', { name: 'Post comment' }).click();
		}
		await page.keyboard.press('Escape');

		const comments = card.locator('[data-testid="card-meta-comments"]');
		await expect(comments).toHaveText('5 comments');

		const activity = card.locator('[data-testid="card-meta-activity"]');
		await expect(activity).toBeVisible();
		const tooltip = await activity.getAttribute('title');
		expect(tooltip).toContain('Created:');
		expect(tooltip).toContain('Updated:');

		const reviewList = page.locator(`[data-testid="list"][data-list-title="${reviewTitle}"]`);
		const describedCard = reviewList.locator(
			`[data-testid="card"][data-card-id="${describedCardId}"]`,
		);
		await expect(
			describedCard.locator('[data-testid="card-meta-description"] .card-meta-detail-icon'),
		).toBeVisible();
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
