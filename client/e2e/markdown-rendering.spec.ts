import { expect, type Locator, test } from '@playwright/test';

// Spec: S006-01 Markdown Rendering + Safety

async function clickCardBackground(
  page: { mouse: { click: (x: number, y: number) => Promise<void> } },
  card: Locator,
): Promise<void> {
  const meta = card.locator('.card-meta');
  if (await meta.count()) {
    await meta.first().click();
    return;
  }
  const box = await card.boundingBox();
  if (!box) {
    throw new Error('Card bounding box missing.');
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6);
}

test('S006-01 renders markdown on cards', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
  await expect(markdownCard).toBeVisible();
  await expect(markdownCard.locator('.card-description strong').first()).toHaveText('bold');
  await expect(markdownCard.locator('.card-description em').first()).toHaveText('italic');
});

test('S006-01 renders markdown in the side panel description', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
  await clickCardBackground(page, markdownCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  const descriptionView = panel.locator('.card-panel-description-view');
  await expect(descriptionView.locator('h1')).toHaveText('Heading level 1');
  await expect(descriptionView.locator('blockquote').first()).toContainText('Blockquote sample');
  await expect(descriptionView.locator('pre').first()).toContainText('code block example');
  await expect(descriptionView.locator('img')).toHaveCount(1);
});

test('S006-01 renders markdown in side panel comments', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
  await clickCardBackground(page, markdownCard);
  const panel = page.locator('[data-testid="card-panel"]');
  await expect(panel).toBeVisible();

  await panel.locator('#card-panel-comment').fill('A *bold* comment with `code`');
  await panel.getByRole('button', { name: 'Post comment' }).click();
  const comment = panel.locator('.card-panel-comment').last();
  await expect(comment.locator('strong')).toHaveText('bold');
  await expect(comment.locator('code')).toHaveText('code');
});
