import { expect, test } from '@playwright/test';

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
  await page.locator('[data-testid="list"][data-list-title="QA"]').locator('[data-testid="remove-list"]').click();
  await expect(page.locator('[data-testid="list"][data-list-title="QA"]')).toHaveCount(0);
});

test('supports card CRUD and drag-and-drop flow', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const inProgressList = page.locator('[data-testid="list"][data-list-title="In Progress"]');

  await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
  await backlogList.locator('[data-testid="add-card-button"]').click();
  await expect(backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' })).toBeVisible();

  const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
  await newCard.locator('[data-testid="edit-card"]').click();
  await newCard.locator('[data-testid="card-description-input"]').fill('Share with the team.');
  await newCard.locator('[data-testid="save-card"]').click();
  await expect(newCard.locator('text=Share with the team.')).toBeVisible();

  await page.dragAndDrop(
    backlogList.locator('[data-testid="card"]').first(),
    inProgressList.locator('[data-testid="card-dropzone"]'),
  );
  await expect(inProgressList.locator('[data-testid="card"]')).toHaveCount(2);

  page.once('dialog', (dialog) => dialog.accept());
  await newCard.locator('[data-testid="remove-card"]').click();
  await expect(backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' })).toHaveCount(0);

  await page.dragAndDrop(
    page.locator('[data-testid="list"]').nth(0),
    page.locator('[data-testid="list"]').nth(1),
  );
  const firstListTitle = await page.locator('[data-testid="list"]').nth(0).getAttribute('data-list-title');
  expect(firstListTitle).not.toBe('Backlog');
});
