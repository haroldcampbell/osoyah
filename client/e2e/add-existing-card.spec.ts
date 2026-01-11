import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S002 Add Existing Card to Board

test('S002 adds an existing card to another board', async ({ page }) => {
  await page.goto('/boards/board-1');
  await expect(page.locator('[data-testid="board"]')).toBeVisible();

  const targetListTitle = `Attach Target ${Date.now()}`;
  await page.goto('/boards/board-2');
  await page.locator('[data-testid="add-list-input"]').fill(targetListTitle);
  await page.locator('[data-testid="add-list-button"]').click();
  await expect(
    page.locator(`[data-testid="list"][data-list-title="${targetListTitle}"]`),
  ).toBeVisible();

  await page.goto('/boards/board-1');
  const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
  const newCardTitle = `Attach card ${Date.now()}`;
  await reviewList.locator('[data-testid="add-card-input"]').fill(newCardTitle);
  await reviewList.locator('[data-testid="add-card-button"]').click();
  const targetCard = reviewList.locator('[data-testid="card"]', { hasText: newCardTitle });
  await expect(targetCard).toBeVisible();

  await clickCardBackground(page, targetCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  const boardSelect = panel.locator('[data-testid="attach-board-select"]');
  const listSelect = panel.locator('[data-testid="attach-list-select"]');
  await expect(boardSelect).toBeVisible();
  await boardSelect.selectOption({ value: 'board-1' });
  const attachButton = panel.locator('[data-testid="attach-board-button"]');
  await expect(attachButton).toBeDisabled();
  await expect(panel.locator('.card-panel-attach-status')).toContainText(
    'Card already on this board.',
  );
  await boardSelect.selectOption({ value: 'board-2' });
  await listSelect.selectOption({ label: targetListTitle });

  await expect(attachButton).toBeEnabled();
  await attachButton.click();

  const status = panel.locator('[data-testid="attach-status"]');
  await expect(status).toBeVisible();
  await expect(status).toContainText(`Added to Sales Pipeline / ${targetListTitle}.`);
});
