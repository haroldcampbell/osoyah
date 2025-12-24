import { expect, test } from '@playwright/test';

// Spec: S005 Card Density Layout

test('S005 shows metadata and markdown preview on cards', async ({ page }) => {
  await page.goto('/');

  const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
  const card = backlogList.locator('[data-testid="card"][data-card-id="card-1"]');
  await expect(card).toBeVisible();

  const comments = card.locator('[data-testid="card-meta-comments"]');
  await expect(comments).toHaveText('5 comments');

  const activity = card.locator('[data-testid="card-meta-activity"]');
  await expect(activity).toBeVisible();
  const tooltip = await activity.getAttribute('title');
  expect(tooltip).toContain('Created:');
  expect(tooltip).toContain('Updated:');

  const reviewList = page.locator('[data-testid="list"][data-list-title="Review"]');
  const markdownCard = reviewList.locator('[data-testid="card"][data-card-id="card-5"]');
  await expect(markdownCard.locator('.card-description strong')).toHaveText('responses');
});
