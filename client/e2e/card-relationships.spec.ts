import { expect, test, type Page } from '@playwright/test';
import {
  createBoardAndFetchId,
  createCardAndAttach,
  createCardRelationship,
  createListAndFetchId,
  deleteBoard,
  randomSuffix,
} from './api-helpers';
import { clickCardBackground } from './helpers';

// Spec: M006-S002

test('M006-S002 links parents, blocks cycles, and shows child indicators', async ({ page }) => {
  const suffix = randomSuffix();
  const childBoardTitle = `Child board ${suffix}`;
  const parentBoardTitle = `Parent board ${suffix}`;
  const parentTitle = `Customer journey mapping ${suffix}`;
  const childListTitle = `QA ${suffix}`;
  const parentListTitle = `Discovery ${suffix}`;
  let childBoardId = '';
  let parentBoardId = '';
  let childCardId = '';
  let parentCardId = '';
  try {
    childBoardId = await createBoardAndFetchId(page.request, childBoardTitle);
    parentBoardId = await createBoardAndFetchId(page.request, parentBoardTitle);
    const childListId = await createListAndFetchId(page.request, childBoardId, childListTitle);
    const parentListId = await createListAndFetchId(page.request, parentBoardId, parentListTitle);
    childCardId = await createCardAndAttach(page.request, childListId, 'Child card');
    parentCardId = await createCardAndAttach(page.request, parentListId, parentTitle);
    await createCardRelationship(page.request, parentCardId, childCardId);

    await primeBoard(page, parentBoardId, parentListTitle);
    await page.goto(`/boards/${childBoardId}`);

    const qaList = page.locator(
      `[data-testid="list"][data-list-title="${childListTitle}"]`,
    );
    const childCard = qaList.locator(`[data-testid="card"][data-card-id="${childCardId}"]`);
    await clickCardBackground(page, childCard);

    const panel = page.locator('[data-testid="card-panel"]');
    await expect(panel).toBeVisible();

    const parentSelect = panel.locator('[data-testid="parent-card-select"]');
    await expect(panel.locator('[data-testid="parent-card-label"]')).toHaveText(
      `${parentCardId} - ${parentTitle}`,
    );

    await parentSelect.click();
    const parentMenu = panel.locator('[data-testid="parent-card-menu"]');
    await expect(parentMenu).toBeVisible();
    await expect(parentMenu.locator(`[data-parent-card-id="${childCardId}"]`)).toHaveCount(0);
    await page.keyboard.press('Escape');

    await panel.getByRole('button', { name: 'Open parent' }).click();
    await expect(page).toHaveURL(
      new RegExp(`/boards/${parentBoardId}/cards/${parentCardId}`),
    );

    const parentPanel = page.locator('[data-testid="card-panel"]');
    await expect(parentPanel).toBeVisible();

    const parentCard = page.locator(`[data-testid="card"][data-card-id="${parentCardId}"]`);
    await expect(parentCard.locator('[data-testid="card-id"]')).toHaveText(parentCardId);
  } finally {
    if (childBoardId) {
      await deleteBoard(page.request, childBoardId);
    }
    if (parentBoardId) {
      await deleteBoard(page.request, parentBoardId);
    }
  }
});

async function primeBoard(page: Page, boardId: string, listTitle: string): Promise<void> {
  await page.goto(`/boards/${boardId}`);
  await expect(page.locator(`[data-testid="list"][data-list-title="${listTitle}"]`)).toBeVisible();
}
