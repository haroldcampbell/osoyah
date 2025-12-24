import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing

test('S003 edits a list title inline', async ({ page }) => {
  await page.goto('/');

  const lists = page.locator('[data-testid="list"]');
  const initialCount = await lists.count();
  const reviewTitle = 'Review Temp';
  await page.locator('[data-testid="add-list-input"]').fill(reviewTitle);
  await page.locator('[data-testid="add-list-button"]').click();
  await expect(lists).toHaveCount(initialCount + 1);
  const newList = lists.nth(initialCount);
  const newListId = await newList.getAttribute('data-list-id');
  if (!newListId) {
    throw new Error('New list id missing after add.');
  }
  const reviewList = page.locator(`[data-testid="list"][data-list-id="${newListId}"]`);
  await expect(reviewList).toHaveAttribute('data-list-title', reviewTitle);

  await reviewList.locator('[data-testid="list-title"]').click();
  const renamedTitle = 'QA Temp';
  await reviewList.locator('[data-testid="list-title-input"]').fill(renamedTitle);
  await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
  await expect(reviewList).toHaveAttribute('data-list-title', renamedTitle);
});

test('S003 edits a card title inline', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const firstCard = backlogList.locator('[data-testid="card"]').first();
  await firstCard.locator('[data-testid="card-title"]').click();

  const titleInput = firstCard.locator('[data-testid="card-title-input"]');
  await titleInput.fill('Updated card title');
  await titleInput.press('Enter');

  await expect(
    backlogList.locator('[data-testid="card"]', { hasText: 'Updated card title' }),
  ).toBeVisible();
});
