import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: S003 Inline Title Editing + S004 Interaction Hygiene

test('S003/S004 adds, renames, and removes a list', async ({ page }) => {
	const suffix = randomSuffix();
	const boardTitle = `List manage ${suffix}`;
	let boardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		await createListAndFetchId(page.request, boardId, `Backlog ${suffix}`);

		await page.goto(`/boards/${boardId}`);

		await expect(page.locator('[data-testid="board"]')).toBeVisible();
		const reviewTitle = `Review Temp ${suffix}`;
		await page.locator('[data-testid="add-list-input"]').fill(reviewTitle);
		await page.locator('[data-testid="add-list-button"]').click();
		const reviewList = page.locator(
			`[data-testid="list"][data-list-title="${reviewTitle}"]`,
		);
		await expect(reviewList).toBeVisible();

		await reviewList.locator('[data-testid="list-title"]').click();
		const renamedTitle = `QA Temp ${suffix}`;
		await reviewList.locator('[data-testid="list-title-input"]').fill(renamedTitle);
		await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
		const renamedList = page.locator(
			`[data-testid="list"][data-list-title="${renamedTitle}"]`,
		);
		await expect(renamedList).toBeVisible();

		page.once('dialog', (dialog) => dialog.accept());
		await renamedList.locator('[data-testid="list-menu"]').click({ force: true });
		await renamedList.locator('[data-testid="remove-list"]').click();
		await expect(
			page.locator(`[data-testid="list"][data-list-title="${renamedTitle}"]`),
		).toHaveCount(0);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
