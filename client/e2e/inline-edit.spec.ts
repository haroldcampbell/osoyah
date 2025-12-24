import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing

test('S003 edits a list title inline', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-testid="add-list-input"]').fill('Review');
  await page.locator('[data-testid="add-list-button"]').click();
  const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
  await expect(reviewList).toBeVisible();

  await reviewList.locator('[data-testid="list-title"]').click();
  await reviewList.locator('[data-testid="list-title-input"]').fill('QA');
  await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
  await expect(page.locator('[data-testid="list"][data-list-title="QA"]')).toBeVisible();
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
