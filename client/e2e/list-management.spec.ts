import { expect, test } from '@playwright/test';

// Spec: S003 Inline Title Editing + S004 Interaction Hygiene

test('S003/S004 adds, renames, and removes a list', async ({ page }) => {
  await page.goto('/boards/board-1');

  await expect(page.locator('[data-testid="board"]')).toBeVisible();
  const reviewTitle = `Review Temp ${Date.now()}`;
  await page.locator('[data-testid="add-list-input"]').fill(reviewTitle);
  await page.locator('[data-testid="add-list-button"]').click();
  const reviewList = page.locator(
    `[data-testid="list"][data-list-title="${reviewTitle}"]`,
  );
  await expect(reviewList).toBeVisible();

  await reviewList.locator('[data-testid="list-title"]').click();
  const renamedTitle = 'QA Temp';
  await reviewList.locator('[data-testid="list-title-input"]').fill(renamedTitle);
  await reviewList.locator('[data-testid="list-title-input"]').press('Enter');
  const renamedList = page.locator(
    `[data-testid="list"][data-list-title="${renamedTitle}"]`,
  );
  await expect(renamedList).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await renamedList.locator('[data-testid="list-menu"]').click({ force: true });
  await renamedList.locator('[data-testid="remove-list"]').click();
  await expect(
    page.locator(`[data-testid="list"][data-list-title="${renamedTitle}"]`),
  ).toHaveCount(0);
});
