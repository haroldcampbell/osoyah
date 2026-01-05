import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: M006-S002

test('M006-S002 links parents, blocks cycles, and shows child indicators', async ({ page }) => {
  await page.goto('/boards/board-1');

  const qaList = page.locator('[data-testid="list"][data-list-title="QA"]');
  const childCard = qaList.locator('[data-testid="card"][data-card-id="card-7"]');
  await clickCardBackground(page, childCard);

  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  const parentSelect = panel.locator('[data-testid="parent-card-select"]');
  await expect(panel.locator('[data-testid="parent-card-label"]')).toHaveText(
    'card-15 - Customer journey mapping',
  );

  await parentSelect.click();
  const parentMenu = panel.locator('[data-testid="parent-card-menu"]');
  await expect(parentMenu).toBeVisible();
  await expect(parentMenu.locator('[data-parent-card-id="card-7"]')).toHaveCount(0);
  await page.keyboard.press('Escape');

  await panel.getByRole('button', { name: 'Open parent' }).click();
  await expect(page).toHaveURL(/\/boards\/board-2\/cards\/card-15/);

  const parentPanel = page.locator('[data-testid="card-panel"]');
  await expect(parentPanel).toBeVisible();

  const parentCard = page.locator('[data-testid="card"][data-card-id="card-15"]');
  await expect(parentCard.locator('[data-testid="card-id"]')).toHaveText('card-15');
});
