// import { expect, type Locator, test } from '@playwright/test';

// // Spec: S001 Global Card Identity + Board Memberships

// async function dragToCenter(
// 	page: {
// 		mouse: {
// 			move: (x: number, y: number, options?: { steps?: number }) => Promise<void>;
// 			down: () => Promise<void>;
// 			up: () => Promise<void>;
// 		};
// 		waitForTimeout: (ms: number) => Promise<void>;
// 	},
// 	source: Locator,
// 	target: Locator,
// ): Promise<void> {
// 	await source.scrollIntoViewIfNeeded();
// 	await target.scrollIntoViewIfNeeded();
// 	const sourceBox = await source.boundingBox();
// 	const targetBox = await target.boundingBox();
// 	if (!sourceBox || !targetBox) {
// 		throw new Error('Drag-and-drop targets not visible.');
// 	}
// 	await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, {
// 		steps: 10,
// 	});
// 	await page.mouse.down();
// 	await page.waitForTimeout(100);
// 	await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
// 		steps: 10,
// 	});
// 	await page.waitForTimeout(100);
// 	await page.mouse.up();
// }

// test('S001 renders cards from the global store and preserves IDs on drag', async ({ page }) => {
// 	await page.goto('/');

// 	const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
// 	const inProgressList = page.locator('[data-testid="list"][data-list-title="In Progress"]');
// 	const cardId = 'card-1';

// 	const card = backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`);
// 	await expect(card).toBeVisible();

// 	await dragToCenter(page, card, inProgressList.locator('[data-testid="card-dropzone"]'));

// 	await expect(inProgressList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toBeVisible();
// 	await expect(backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toHaveCount(0);
// });
