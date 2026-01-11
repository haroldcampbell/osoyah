import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S002 Card Detail Side Panel

test('S002 opens the card panel, manages comments, and closes it', async ({ page }) => {
  await page.goto('/boards/board-1');

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

// Spec: S007 Card Panel List Picker
test('S007 moves cards with the list picker', async ({ page }) => {
  await page.goto('/boards/board-1');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const firstCard = backlogList.locator('[data-testid="card"]').first();
  const cardId = await firstCard.getAttribute('data-card-id');
  if (!cardId) {
    throw new Error('Card id missing before list move.');
  }

  await clickCardBackground(page, firstCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  const listTrigger = panel.getByTestId('card-panel-list-trigger');
  await listTrigger.scrollIntoViewIfNeeded();
  await listTrigger.click();

  const listMenu = panel.getByTestId('card-panel-list-menu');
  await expect(listMenu).toBeVisible();
  const doneOption = listMenu.locator('.card-panel-list-option', { hasText: 'Done' });
  await expect(doneOption).toBeVisible();
  await doneOption.click();

  await expect(listTrigger).toContainText('Done');

  const doneList = page.locator('[data-testid="list"][data-list-title="Done"]');
  await expect(doneList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toBeVisible();
  await expect(backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toHaveCount(
    0,
  );
});

test('S007 scrolls the target list into view after list picker moves a card', async ({ page }) => {
  await page.goto('/boards/board-1');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const doneList = page.locator('[data-testid="list"][data-list-title="Done"]');
  const firstCard = backlogList.locator('[data-testid="card"]').first();
  const cardId = await firstCard.getAttribute('data-card-id');
  const lists = page.locator('.lists');

  const initialScrollLeft = await lists.evaluate((element) => {
    element.scrollLeft = 0;
    return element.scrollLeft;
  });
  const canScroll = await lists.evaluate((element) => element.scrollWidth > element.clientWidth);
  const doneWasVisible = await doneList.evaluate((element) => {
    const container = element.closest('.lists');
    if (!container) {
      return true;
    }
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return rect.left >= containerRect.left && rect.right <= containerRect.right;
  });

  await clickCardBackground(page, firstCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  const listTrigger = panel.getByTestId('card-panel-list-trigger');
  await listTrigger.scrollIntoViewIfNeeded();
  await listTrigger.click();

  const listMenu = panel.getByTestId('card-panel-list-menu');
  await expect(listMenu).toBeVisible();
  const doneOption = listMenu.locator('.card-panel-list-option', { hasText: 'Done' });
  await expect(doneOption).toBeVisible();
  await doneOption.click();

  if (!doneWasVisible && canScroll) {
    await expect
      .poll(async () => {
        const container = await lists.evaluate((element) => element.getBoundingClientRect());
        const doneRect = await doneList.evaluate((element) => element.getBoundingClientRect());
        const currentScrollLeft = await lists.evaluate((element) => element.scrollLeft);
        const doneInView = doneRect.left >= container.left && doneRect.right <= container.right;
        return doneInView || currentScrollLeft > initialScrollLeft;
      })
      .toBe(true);
  }

  if (cardId) {
    await expect(doneList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toBeVisible();
  }
});
