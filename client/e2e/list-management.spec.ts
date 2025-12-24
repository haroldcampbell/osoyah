import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing + S004 Interaction Hygiene

test('S003/S004 adds, renames, and removes a list', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="board"]')).toBeVisible();
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

  page.once('dialog', (dialog) => dialog.accept());
  await reviewList.locator('[data-testid="list-menu"]').click({ force: true });
  await reviewList.locator('[data-testid="remove-list"]').click();
  await expect(page.locator(`[data-testid="list"][data-list-id="${newListId}"]`)).toHaveCount(0);
  await expect(lists).toHaveCount(initialCount);
});
