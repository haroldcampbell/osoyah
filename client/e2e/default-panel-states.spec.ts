import { expect, test } from '@playwright/test';

// Spec: M008-S003

test('M008-S003 defaults hierarchy closed and roll-up metrics off', async ({ page }) => {
  await page.goto('/boards/board-3');

  const hierarchyPanel = page.locator('[data-testid="hierarchy-panel"]');
  await expect(hierarchyPanel).toHaveCount(0);

  const hierarchyToggle = page.locator('[data-testid="hierarchy-toggle"]');
  await expect(hierarchyToggle).toHaveAttribute('aria-expanded', 'false');
  await hierarchyToggle.click();
  await expect(hierarchyPanel).toBeVisible();

  const rollups = page.locator('[data-testid="hierarchy-rollups"]');
  await expect(rollups).toHaveCount(0);

  const settingsToggle = page.locator('[data-testid="board-settings-toggle"]');
  await settingsToggle.click();
  const settings = page.locator('[data-testid="board-settings"]');
  await expect(settings).toBeVisible();

  const rollupsToggle = settings.locator('[data-testid="board-settings-rollups"]');
  await expect(rollupsToggle).not.toBeChecked();
  await rollupsToggle.check();
  await settings.locator('[data-testid="board-settings-save"]').click();
  await expect(settings).toHaveCount(0);

  await expect(rollups).toBeVisible();
  await expect(rollups.getByRole('button', { name: 'Direct' })).toHaveClass(/active/);

  await settingsToggle.click();
  const reopenedSettings = page.locator('[data-testid="board-settings"]');
  await expect(reopenedSettings).toBeVisible();
  const reopenedRollupsToggle = reopenedSettings.locator('[data-testid="board-settings-rollups"]');
  await reopenedRollupsToggle.uncheck();
  await reopenedSettings.locator('[data-testid="board-settings-save"]').click();
  await expect(reopenedSettings).toHaveCount(0);
  await expect(rollups).toHaveCount(0);
});
