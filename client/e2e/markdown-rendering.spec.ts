import { expect, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S006-01 Markdown Rendering + Safety


test('S006-01 shows a details indicator on cards with descriptions', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

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
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

	const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
	const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
	await clickCardBackground(page, markdownCard);
	const panel = page.locator('[data-testid="card-panel"]');
	await expect(panel).toBeVisible();

	const descriptionView = panel.locator('.card-panel-description-view');
	await descriptionView.scrollIntoViewIfNeeded();
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

	const viewBox = await descriptionView.boundingBox();
	if (!viewBox) {
		throw new Error('Missing description view dimensions.');
	}
	await descriptionView.click();
	const textarea = page.locator('#card-panel-description');
	await expect(textarea).toBeVisible();
	const editBox = await textarea.boundingBox();
	if (!editBox) {
		throw new Error('Missing description editor dimensions.');
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
	await expect(page.locator('[data-testid="board"]')).toBeVisible();

	const backlogList = page.locator('[data-testid="list"][data-list-title="Backlog"]');
	const markdownCard = backlogList.locator('[data-testid="card"][data-card-id="card-14"]');
	await clickCardBackground(page, markdownCard);
	const panel = page.locator('[data-testid="card-panel"]');
	await expect(panel).toBeVisible();

	const commentInput = panel.locator('#card-panel-comment');
	await commentInput.scrollIntoViewIfNeeded();
	await expect(commentInput).toBeVisible();
	await commentInput.fill('A *bold* comment with `code`');
	await panel.getByRole('button', { name: 'Post comment' }).click();
	const comment = panel.locator('.card-panel-comment').last();
	await expect(comment).toBeVisible();
	await expect(comment.locator('strong')).toHaveText('bold');
	await expect(comment.locator('code')).toHaveText('code');
});
