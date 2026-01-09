import { expect, test } from '@playwright/test';

// Spec: S002 Board View Modes (List)

test('S002 toggles list view, expands rows, and opens card panel from list', async ({ page }) => {
  await page.goto('/boards/board-1');

  await expect(page.locator('[data-testid="board"]')).toBeVisible();
  await page.locator('[data-testid="view-list"]').click();
  await expect(page.locator('[data-testid="list-view"]')).toBeVisible();

  const parentRow = page.locator('[data-testid="list-view-row"][data-card-id="card-1"]');
  await expect(parentRow).toBeVisible();
  await parentRow.locator('[data-testid="list-view-toggle"]').click();

  const detailPanel = page.locator('#list-view-detail-card-1');
  await expect(detailPanel).toBeVisible();
  await expect(detailPanel.locator('[data-card-id="card-2"]')).toBeVisible();
  await expect(detailPanel.locator('[data-card-id="card-14"]')).toBeVisible();

  await parentRow.locator('[data-testid="list-view-title"]').click();
  await expect(page).toHaveURL(/\/boards\/board-1\/cards\/card-1/);
  const cardPanel = page.locator('[data-testid="card-panel"]');
  await expect(cardPanel).toBeVisible();
  await cardPanel.getByRole('button', { name: 'Close' }).click();
  await expect(cardPanel).toHaveCount(0);

  await page.locator('[data-testid="view-cards"]').click();
  await expect(page.locator('[data-testid="list-view"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="list"]')).toHaveCount(7);

  await page.goto('/boards/board-2');
  await expect(page.locator('[data-testid="list-view"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="list"]')).toHaveCount(4);
});
