import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S002 Card Detail Side Panel


test('S002 opens the card panel, manages comments, and closes it', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const firstCard = backlogList.locator('[data-testid="card"]').first();

  await clickCardBackground(page, firstCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  await panel.locator('#card-panel-comment').fill('First comment');
  await panel.getByRole('button', { name: 'Post comment' }).click();
  const comment = panel.locator('.card-panel-comment', { hasText: 'First comment' });
  await expect(comment).toBeVisible();

  await comment.hover();
  await comment.getByRole('button', { name: 'Delete' }).click();
  await expect(panel.locator('.card-panel-comment-body', { hasText: 'First comment' })).toHaveCount(
    0,
  );

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});
