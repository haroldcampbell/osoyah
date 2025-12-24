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

test('S002 adds a card, updates description, and deletes it from the panel', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');

  await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
  await backlogList.locator('[data-testid="add-card-button"]').click();
  const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
  await expect(newCard).toBeVisible();

  const newCardId = await newCard.getAttribute('data-card-id');
  if (!newCardId) {
    throw new Error('New card id missing after add.');
  }
  const newCardById = backlogList.locator(`[data-testid="card"][data-card-id="${newCardId}"]`);

  await clickCardBackground(page, newCardById);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();
  await panel.locator('#card-panel-description').fill('Share with the team.');
  await panel.locator('.card-panel-title').click();
  await expect(newCardById.locator('text=Share with the team.')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await panel.getByTestId('card-panel-menu').click();
  await panel.getByRole('button', { name: 'Delete card' }).click();
  await expect(
    backlogList.locator(`[data-testid="card"][data-card-id="${newCardId}"]`),
  ).toHaveCount(0);
});
