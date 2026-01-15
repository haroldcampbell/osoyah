import { expect, test } from '@playwright/test';
import {
	createBoardAndFetchId,
	createCardAndAttach,
	createListAndFetchId,
	deleteBoard,
	randomSuffix,
} from './api-helpers';
import { clickCardBackground } from './helpers';

// Spec: S006-01 Markdown Rendering + Safety

test('S006-01 shows a details indicator on cards with descriptions', async ({ page }) => {
  const suffix = randomSuffix();
  const markdown = `
# Heading level 1

Here is some context.

## Heading level 2

Paragraph with *bold*, _italic_, ***bold + italic***, and \`inline code\`.

- Bullet item one
- Bullet item two with a [link](https://example.com "Example title")
  - Nested bullet with \`code\`

> Blockquote sample
>
> Second paragraph in the same quote.

\`\`\`
code block example
const value = 42;
\`\`\`

\`\`\`js
// fenced code with language
const greeting = 'hello';
\`\`\`

1. Numbered item one
2. Numbered item two
   1. Nested ordered item

![Alt text](https://placehold.co/600x400 "Image title")

### Another header

> Nested blockquote
> Deeper explanation here.
> Another line

Final paragraph to wrap up the reference.
`.trim();

  const boardTitle = `Markdown ${suffix}`;
  const backlogTitle = `Backlog ${suffix}`;
  let boardId = '';
  let cardId = '';
  try {
    boardId = await createBoardAndFetchId(page.request, boardTitle);
    const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
    cardId = await createCardAndAttach(page.request, backlogListId, 'Markdown card', markdown);

    await page.goto(`/boards/${boardId}`);
    await expect(page.locator('[data-testid="board"]')).toBeVisible();

    const backlogList = page.locator(
      `[data-testid="list"][data-list-title="${backlogTitle}"]`,
    );
    const markdownCard = backlogList.locator(
      `[data-testid="card"][data-card-id="${cardId}"]`,
    );
    await expect(markdownCard).toBeVisible();
    await expect(
      markdownCard.locator('[data-testid="card-meta-description"] .card-meta-detail-icon'),
    ).toBeVisible();
    await expect(markdownCard.locator('.card-description')).toHaveCount(0);
    const meta = markdownCard.locator('[data-testid="card-meta"]');
    await expect(meta.locator('[data-testid="card-meta-description"]')).toBeVisible();
    await expect(meta.locator('[data-testid="card-meta-comments"]')).toBeVisible();
    await expect(meta.locator('[data-testid="card-meta-activity"]')).toBeVisible();
  } finally {
    if (boardId) {
      await deleteBoard(page.request, boardId);
    }
  }
});

test('S006-01 renders markdown in the side panel description', async ({ page }) => {
  const suffix = randomSuffix();
  const markdown = `
# Heading level 1

Here is some context.

## Heading level 2

Paragraph with *bold*, _italic_, ***bold + italic***, and \`inline code\`.

- Bullet item one
- Bullet item two with a [link](https://example.com "Example title")
  - Nested bullet with \`code\`

> Blockquote sample
>
> Second paragraph in the same quote.

\`\`\`
code block example
const value = 42;
\`\`\`

\`\`\`js
// fenced code with language
const greeting = 'hello';
\`\`\`

1. Numbered item one
2. Numbered item two
   1. Nested ordered item

![Alt text](https://placehold.co/600x400 "Image title")

### Another header

> Nested blockquote
> Deeper explanation here.
> Another line

Final paragraph to wrap up the reference.
`.trim();

  const boardTitle = `Markdown panel ${suffix}`;
  const backlogTitle = `Backlog ${suffix}`;
  let boardId = '';
  let cardId = '';
  try {
    boardId = await createBoardAndFetchId(page.request, boardTitle);
    const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
    cardId = await createCardAndAttach(page.request, backlogListId, 'Markdown card', markdown);

    await page.goto(`/boards/${boardId}`);
    await expect(page.locator('[data-testid="board"]')).toBeVisible();

    const backlogList = page.locator(
      `[data-testid="list"][data-list-title="${backlogTitle}"]`,
    );
    const markdownCard = backlogList.locator(
      `[data-testid="card"][data-card-id="${cardId}"]`,
    );
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
  } finally {
    if (boardId) {
      await deleteBoard(page.request, boardId);
    }
  }
});

test('S006-01 renders markdown in side panel comments', async ({ page }) => {
  const suffix = randomSuffix();
  const boardTitle = `Markdown comments ${suffix}`;
  const backlogTitle = `Backlog ${suffix}`;
  let boardId = '';
  let cardId = '';
  try {
    boardId = await createBoardAndFetchId(page.request, boardTitle);
    const backlogListId = await createListAndFetchId(page.request, boardId, backlogTitle);
    cardId = await createCardAndAttach(page.request, backlogListId, 'Markdown card', 'Description');

    await page.goto(`/boards/${boardId}`);
    await expect(page.locator('[data-testid="board"]')).toBeVisible();

    const backlogList = page.locator(
      `[data-testid="list"][data-list-title="${backlogTitle}"]`,
    );
    const markdownCard = backlogList.locator(
      `[data-testid="card"][data-card-id="${cardId}"]`,
    );
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
  } finally {
    if (boardId) {
      await deleteBoard(page.request, boardId);
    }
  }
});
