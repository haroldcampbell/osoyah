import { expect, type Locator, test } from '@playwright/test';

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
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
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

test('renders the board and supports list management', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="board"]')).toBeVisible();
  await expect(page.locator('[data-testid="list"]')).toHaveCount(3);

  await page.locator('[data-testid="add-list-input"]').fill('Review');
  await page.locator('[data-testid="add-list-button"]').click();
  await expect(page.locator('[data-testid="list"][data-list-title="Review"]')).toBeVisible();

  const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
  await reviewList.locator('[data-testid="edit-list"]').click();
  await reviewList.locator('[data-testid="list-title-input"]').fill('QA');
  await reviewList.locator('[data-testid="save-list"]').click();
  await expect(page.locator('[data-testid="list"][data-list-title="QA"]')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page
    .locator('[data-testid="list"][data-list-title="QA"]')
    .locator('[data-testid="remove-list"]')
    .click();
  await expect(page.locator('[data-testid="list"][data-list-title="QA"]')).toHaveCount(0);
});

test('supports card CRUD flow', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');

  await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
  await backlogList.locator('[data-testid="add-card-button"]').click();
  await expect(
    backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' }),
  ).toBeVisible();

  const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
  const newCardId = await newCard.getAttribute('data-card-id');
  if (!newCardId) {
    throw new Error('New card id missing after add.');
  }
  const newCardById = backlogList.locator(`[data-testid="card"][data-card-id="${newCardId}"]`);
  await newCardById.locator('[data-testid="edit-card"]').click();
  await newCardById.locator('[data-testid="card-description-input"]').fill('Share with the team.');
  await newCardById.locator('[data-testid="save-card"]').click();
  await expect(newCardById.locator('text=Share with the team.')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await newCardById.locator('[data-testid="remove-card"]').click();
  await expect(
    backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' }),
  ).toHaveCount(0);
});

test('supports dragging a card between lists', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const inProgressList = page.locator('[data-testid="list"][data-list-title="In Progress"]');

  await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
  await backlogList.locator('[data-testid="add-card-button"]').click();
  const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
  await expect(newCard).toBeVisible();

  const newCardId = await newCard.getAttribute('data-card-id');
  if (!newCardId) {
    throw new Error('New card id missing after add.');
  }
  const newCardById = backlogList.locator(`[data-testid="card"][data-card-id="${newCardId}"]`);
  await dragToCenter(page, newCardById, inProgressList.locator('[data-testid="card-dropzone"]'));

  const newCardInProgress = inProgressList.locator(
    `[data-testid="card"][data-card-id="${newCardId}"]`,
  );
  await expect(newCardInProgress).toBeVisible();
  await expect(
    backlogList.locator(`[data-testid="card"][data-card-id="${newCardId}"]`),
  ).toHaveCount(0);
});

test('supports reordering lists', async ({ page }) => {
  await page.goto('/');

  const lists = page.locator('[data-testid="list"]');
  const firstList = lists.nth(0);
  const secondList = lists.nth(1);
  const originalFirstTitle = await firstList.getAttribute('data-list-title');

  await dragToCenter(page, firstList.locator('[data-testid="list-handle"]'), secondList);
  const updatedFirstTitle = await lists.nth(0).getAttribute('data-list-title');
  expect(updatedFirstTitle).not.toBe(originalFirstTitle);
});
