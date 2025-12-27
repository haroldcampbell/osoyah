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

test('S006-01 shows a details indicator on cards with descriptions', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
  await expect(markdownCard).toBeVisible();
  await expect(
    markdownCard.locator('[data-testid="card-meta-description"] .card-meta-detail-icon'),
  ).toBeVisible();
  await expect(markdownCard.locator('.card-description')).toHaveCount(0);
  const meta = markdownCard.locator('[data-testid="card-meta"]');
  await expect(meta.locator('[data-testid="card-meta-description"]')).toBeVisible();
  await expect(meta.locator('[data-testid="card-meta-comments"]')).toBeVisible();
  await expect(meta.locator('[data-testid="card-meta-activity"]')).toBeVisible();
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
  await expect(descriptionView.locator('a[href*="example.com"]')).toBeVisible();
  await expect(descriptionView.locator('ul li').first()).toContainText('Bullet item one');
  await expect(descriptionView.locator('code').first()).toContainText('inline code');
  await expect(descriptionView.locator('script')).toHaveCount(0);
  const image = descriptionView.locator('img');
  await expect(image).toHaveCount(1);
  const panelBox = await descriptionView.boundingBox();
  const imageBox = await image.first().boundingBox();
  if (!panelBox || !imageBox) {
    throw new Error('Missing image or panel dimensions.');
  }
  expect(imageBox.width).toBeLessThanOrEqual(panelBox.width + 1);

  await descriptionView.click();
  const textarea = page.locator('#card-panel-description');
  const viewBox = await descriptionView.boundingBox();
  const editBox = await textarea.boundingBox();
  if (!viewBox || !editBox) {
    throw new Error('Missing description dimensions.');
  }
  expect(editBox.height).toBeGreaterThanOrEqual(190);
  expect(editBox.height).toBeLessThanOrEqual(420);
  if (viewBox.height <= 360) {
    expect(Math.abs(editBox.height - viewBox.height)).toBeLessThanOrEqual(80);
  } else {
    expect(editBox.height).toBeLessThanOrEqual(viewBox.height);
  }
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
