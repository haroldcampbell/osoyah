import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing + S004 Interaction Hygiene

test('S003/S004 adds, renames, and removes a list', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="board"]')).toBeVisible();
  await expect(page.locator('[data-testid="list"]')).toHaveCount(3);

  await page.locator('[data-testid="add-list-input"]').fill('Review');
  await page.locator('[data-testid="add-list-button"]').click();
  const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
  await expect(reviewList).toBeVisible();

  await reviewList.locator('[data-testid="list-title"]').click();
  await reviewList.locator('[data-testid="list-title-input"]').fill('QA');
  await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
  const qaList = page.locator('[data-testid="list"][data-list-title="QA"]');
  await expect(qaList).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await qaList.locator('[data-testid="list-menu"]').click({ force: true });
  await qaList.locator('[data-testid="remove-list"]').click();
  await expect(qaList).toHaveCount(0);
});
