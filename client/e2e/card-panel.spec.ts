import { expect, type Locator, test } from '@playwright/test';

// Spec: S002 Card Detail Side Panel

async function clickCardBackground(
  page: { mouse: { click: (x: number, y: number) => Promise<void> } },
  card: Locator,
): Promise<void> {
  const box = await card.boundingBox();
  if (!box) {
    throw new Error('Card bounding box missing.');
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6);
}

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
