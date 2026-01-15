import { expect, test, type Page } from '@playwright/test';
import {
  attachCardToList,
  createBoardAndFetchId,
  createCard,
  createListAndFetchId,
  deleteBoard,
  randomSuffix,
} from './api-helpers';
import { clickCardBackground } from './helpers';

// Spec: S003 Membership Indicators + Navigation

test('S003 shows memberships and navigates between boards', async ({ page }) => {
  const suffix = randomSuffix();
  const backlogTitle = `Backlog ${suffix}`;
  const leadsTitle = `Leads ${suffix}`;
  const primaryBoardTitle = `Membership primary ${suffix}`;
  const targetBoardTitle = `Sales Pipeline ${suffix}`;
  let primaryBoardId = '';
  let targetBoardId = '';
  let primaryListId = '';
  let targetListId = '';
  let cardId = '';
  try {
    primaryBoardId = await createBoardAndFetchId(page.request, primaryBoardTitle);
    targetBoardId = await createBoardAndFetchId(page.request, targetBoardTitle);
    primaryListId = await createListAndFetchId(page.request, primaryBoardId, backlogTitle);
    targetListId = await createListAndFetchId(page.request, targetBoardId, leadsTitle);
    cardId = await createCard(page.request, 'Membership card');
    await attachCardToList(page.request, primaryListId, cardId);
    await attachCardToList(page.request, targetListId, cardId);

    await primeBoard(page, targetBoardId, leadsTitle);
    await page.goto(`/boards/${primaryBoardId}`);
    await expect(page.locator('[data-testid="board"]')).toBeVisible();

    const backlogList = page.locator(
      `[data-testid="list"][data-list-title="${backlogTitle}"]`,
    );
    const card = backlogList.locator(`[data-testid="card"][data-card-id="${cardId}"]`);
    await expect(card).toBeVisible();

    await clickCardBackground(page, card);
    const panel = page.locator('[data-testid="card-panel"]');
    await expect(panel).toBeVisible();

    const membershipList = panel.locator('[data-testid="membership-list"]');
    await expect(membershipList).toBeVisible();

    const currentBoard = membershipList.locator(
      `[data-testid="membership-board"][data-board-id="${primaryBoardId}"]`,
    );
    await expect(currentBoard).toBeDisabled();
    await expect(currentBoard).toContainText('Current');

    const targetBoard = membershipList.locator(
      `[data-testid="membership-board"][data-board-id="${targetBoardId}"]`,
    );
    await expect(targetBoard).toBeEnabled();
    await targetBoard.click();

    await expect(page.locator('[data-testid="board-name"]')).toContainText(targetBoardTitle);
    await expect(panel).toBeVisible();

    const leadsList = page.locator(
      `[data-testid="list"][data-list-title="${leadsTitle}"]`,
    );
    await expect(leadsList.locator(`[data-testid="card"][data-card-id="${cardId}"]`)).toBeVisible();
  } finally {
    if (primaryBoardId) {
      await deleteBoard(page.request, primaryBoardId);
    }
    if (targetBoardId) {
      await deleteBoard(page.request, targetBoardId);
    }
  }
});

async function primeBoard(page: Page, boardId: string, listTitle: string): Promise<void> {
  await page.goto(`/boards/${boardId}`);
  await expect(page.locator(`[data-testid="list"][data-list-title="${listTitle}"]`)).toBeVisible();
}
