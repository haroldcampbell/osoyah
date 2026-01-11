import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing

test('S003 edits a list title inline', async ({ page }) => {
  await page.goto('/boards/board-1');

  const reviewTitle = `Review Temp ${Date.now()}`;
  await page.locator('[data-testid="add-list-input"]').fill(reviewTitle);
  await page.locator('[data-testid="add-list-button"]').click();
  const reviewList = page.locator(
    `[data-testid="list"][data-list-title="${reviewTitle}"]`,
  );
  await expect(reviewList).toBeVisible();

  await reviewList.locator('[data-testid="list-title"]').click();
  const renamedTitle = `QA Temp ${Date.now()}`;
  await reviewList.locator('[data-testid="list-title-input"]').fill(renamedTitle);
  await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
  const renamedList = page.locator(
    `[data-testid="list"][data-list-title="${renamedTitle}"]`,
  );
  await expect(renamedList).toBeVisible();
});

test('S003 edits a card title inline', async ({ page }) => {
  await page.goto('/boards/board-1');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const firstCard = backlogList.locator('[data-testid="card"]').first();
  const cardId = await firstCard.getAttribute('data-card-id');
  if (!cardId) {
    throw new Error('Card id missing before edit.');
  }
  await firstCard.hover();
  await firstCard.locator('[data-testid="card-edit-button"]').click();

  const titleInput = firstCard.locator('[data-testid="card-title-input"]');
  await titleInput.fill('Updated card title');
  await firstCard.locator('[data-testid="card-edit-save"]').click();

  const updatedCard = backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`);
  await expect(updatedCard).toContainText('Updated card title');
});
