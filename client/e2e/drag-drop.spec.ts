import { expect, type Locator, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';

// Spec: S006-02 Drag Placeholder Cues (drag flow)

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

test('S006-02 supports dragging a card between lists', async ({ page }) => {
	const suffix = randomSuffix();
	const backlogTitle = `Backlog ${suffix}`;
	const inProgressTitle = `In Progress ${suffix}`;
	const boardTitle = `Drag drop ${suffix}`;
	let boardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		await createListAndFetchId(page.request, boardId, backlogTitle);
		await createListAndFetchId(page.request, boardId, inProgressTitle);

		await page.goto(`/boards/${boardId}`);

		const backlogList = page.locator(
			`[data-testid="list"][data-list-title="${backlogTitle}"]`,
		);
		const inProgressList = page.locator(
			`[data-testid="list"][data-list-title="${inProgressTitle}"]`,
		);

		await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
		await backlogList.locator('[data-testid="add-card-button"]').click();
		const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
		await expect(newCard).toBeVisible();

		await dragToCenter(page, newCard, inProgressList.locator('[data-testid="card-dropzone"]'));

		const newCardInProgress = inProgressList.locator('[data-testid="card"]', {
			hasText: 'Draft launch notes',
		});
		await expect(newCardInProgress).toBeVisible();
		await expect(
			backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' }),
		).toHaveCount(0);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});

test('S006-02 supports reordering lists', async ({ page }) => {
	const suffix = randomSuffix();
	const boardTitle = `List reorder ${suffix}`;
	const firstTitle = `First ${suffix}`;
	const secondTitle = `Second ${suffix}`;
	const thirdTitle = `Third ${suffix}`;
	let boardId = '';
	try {
		boardId = await createBoardAndFetchId(page.request, boardTitle);
		await createListAndFetchId(page.request, boardId, firstTitle);
		await createListAndFetchId(page.request, boardId, secondTitle);
		await createListAndFetchId(page.request, boardId, thirdTitle);

		await page.goto(`/boards/${boardId}`);

		const lists = page.locator('[data-testid="list"]');
		const firstList = lists.nth(0);
		const secondList = lists.nth(1);
		const originalFirstTitle = await firstList.getAttribute('data-list-title');

		await dragToCenter(page, firstList.locator('[data-testid="list-handle"]'), secondList);
		const updatedFirstTitle = await lists.nth(0).getAttribute('data-list-title');
		expect(updatedFirstTitle).not.toBe(originalFirstTitle);
	} finally {
		if (boardId) {
			await deleteBoard(page.request, boardId);
		}
	}
});
