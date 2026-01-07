import { expect, type Locator, test } from '@playwright/test';

// Spec: M007-S003

async function dragToCenter(page: { mouse: { move: (x: number, y: number, options?: { steps?: number }) => Promise<void>; down: () => Promise<void>; up: () => Promise<void> }; waitForTimeout: (ms: number) => Promise<void> }, source: Locator, target: Locator): Promise<void> {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error('Drag-and-drop targets not visible.');
  }
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, { steps: 10 });
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
  await page.waitForTimeout(100);
  await page.mouse.up();
}

test('M007-S003 manages hierarchy parents and sibling ordering', async ({ page }) => {
  await page.goto('/boards/board-3');

  const hierarchyPanel = page.locator('[data-testid="hierarchy-panel"]');
  await expect(hierarchyPanel).toBeVisible();

  await hierarchyPanel.locator('[data-testid="hierarchy-edit-toggle"]').click();

  const parentButton = hierarchyPanel.locator('[data-testid="hierarchy-parent-button"]');
  await parentButton.click();

  const parentMenu = hierarchyPanel.locator('[data-testid="hierarchy-parent-menu"]');
  await expect(parentMenu).toBeVisible();
  const selfOption = parentMenu.locator('[data-parent-board-id="board-3"]');
  await expect(selfOption).toBeDisabled();
  await expect(
    selfOption.locator('..').locator('.board-hierarchy-parent-helper'),
  ).toHaveText('Cannot parent a board to itself.');
  await parentMenu.locator('[data-parent-board-id="root"]').click();

  const hierarchyTree = hierarchyPanel.locator('[data-testid="hierarchy-tree"]');
  await expect(
    hierarchyTree.locator('[data-testid="hierarchy-node"][data-board-id="board-3"]'),
  ).toBeVisible();
  await expect(
    hierarchyTree.locator(
      ':scope > [data-testid="hierarchy-node"][data-board-id="board-3"]',
    ),
  ).toHaveCount(1);

  const reorderList = hierarchyPanel.locator('[data-testid="hierarchy-reorder"]');
  const reorderItems = reorderList.locator('[data-testid="hierarchy-reorder-item"]');
  const firstChild = reorderItems.first();
  const secondChild = reorderItems.nth(1);

  const firstChildId = await firstChild.getAttribute('data-board-id');
  const secondChildId = await secondChild.getAttribute('data-board-id');
  if (!firstChildId || !secondChildId) {
    throw new Error('Hierarchy child ids missing.');
  }

  await dragToCenter(
    page,
    secondChild.locator('[data-testid="hierarchy-reorder-handle"]'),
    firstChild,
  );

  const reorderedFirst = await reorderItems.first().getAttribute('data-board-id');
  expect(reorderedFirst).toBe(secondChildId);

  const childrenContainer = hierarchyPanel.locator(
    '[data-testid="hierarchy-children"][data-parent-board-id="board-3"]',
  );
  const directChildren = childrenContainer.locator(
    ':scope > [data-testid="hierarchy-node"]',
  );
  const treeFirstId = await directChildren.first().getAttribute('data-board-id');
  expect(treeFirstId).toBe(secondChildId);
});
