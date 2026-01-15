import { expect, type Locator, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createCardAndAttach,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: S001 Global Card Identity + Board Memberships

async function dragToCenter(
  page: {
    mouse: {
      move: (x: number, y: number, options?: { steps?: number }) => Promise<void>;
      down: () => Promise<void>;
      up: () => Promise<void>;
    };
    waitForTimeout: (ms: number) => Promise<void>;
  },
  source: Locator,
  target: Locator,
): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await source.scrollIntoViewIfNeeded();
      await target.scrollIntoViewIfNeeded();
      break;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error('Drag-and-drop targets not visible.');
  }
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, {
    steps: 10,
  });
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 10,
  });
  await page.waitForTimeout(100);
  await page.mouse.up();
}

test('S001 renders cards from the global store and preserves IDs on drag', async ({ page }) => {
	const suffix = randomSuffix();
	const backlogTitle = `Backlog ${suffix}`;
	const inProgressTitle = `In Progress ${suffix}`;
	const boardTitle = `Global identity ${suffix}`;
	let boardId = '';
	let cardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
		await createListAndFetchId(page.request, boardId, inProgressTitle);
		cardId = await createCardAndAttach(page.request, backlogListId, 'Global identity card');

		await page.goto(`/boards/${boardId}`);

		const backlogList = page.locator(
			`[data-testid="list"][data-list-title="${backlogTitle}"]`,
		);
		const inProgressList = page.locator(
			`[data-testid="list"][data-list-title="${inProgressTitle}"]`,
		);

		const backlogCard = backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`);
		const inProgressCard = inProgressList.locator(
			`[data-testid="card"][data-card-id="${cardId}"]`,
		);
		const backlogCount = await backlogCard.count();
		const inProgressCount = await inProgressCard.count();
		if (!backlogCount && !inProgressCount) {
			throw new Error(`Expected ${cardId} to exist on the board.`);
		}

		let moved = inProgressCount > 0;
		if (!moved) {
			const dropzone = inProgressList.locator('[data-testid="card-dropzone"]');
			for (let attempt = 0; attempt < 2; attempt += 1) {
				await dragToCenter(page, backlogCard, dropzone);
				const count = await inProgressCard.count();
				if (count === 1) {
					moved = true;
					break;
				}
			}
		}

		expect(moved).toBe(true);
		await expect(inProgressCard).toBeVisible();
		await expect(backlogCard).toHaveCount(0);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
