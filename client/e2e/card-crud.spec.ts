import { expect, type APIRequestContext, test } from '@playwright/test';
import { clickCardBackground } from './helpers';

// Spec: S002 Card Detail Side Panel

test('S002 adds a card, updates description, and deletes it from the panel', async ({ page }) => {
	const suffix = Math.random().toString(36).slice(2, 6);
	const boardTitle = `new_board_${suffix}`;
	const listTitle = `new_list_${suffix}`;
	const apiBaseUrl = process.env.OSOYAH_API_BASE_URL ?? 'http://127.0.0.1:9876';
	let boardId = '';
	let listId = '';

	try {
		await apiPost(page.request, apiBaseUrl, '/api/boards', { title: boardTitle });
		const boardsPayload = await apiGet<{ boards: Array<{ id: string; title: string }> }>(
			page.request,
			apiBaseUrl,
			'/api/boards',
		);
		const createdBoard = boardsPayload.boards.find((board) => board.title === boardTitle);
		if (!createdBoard) {
			throw new Error('Created board not found via API.');
		}
		boardId = createdBoard.id;
		await apiPost(page.request, apiBaseUrl, `/api/boards/${boardId}/lists`, { title: listTitle });
		const boardPayload = await apiGet<{ lists: Array<{ id: string; title: string }> }>(
			page.request,
			apiBaseUrl,
			`/api/boards/${boardId}`,
		);
		const createdList = boardPayload.lists.find((list) => list.title === listTitle);
		if (!createdList) {
			throw new Error('Created list not found via API.');
		}
		listId = createdList.id;

		await page.goto(`/boards/${boardId}`);

		const backlogList = page.locator(`[data-testid="list"][data-list-title="${listTitle}"]`);

		await backlogList.locator('[data-testid="add-card-input"]').fill('Draft launch notes');
		await backlogList.locator('[data-testid="add-card-button"]').click();
		const newCard = backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' });
		await expect(newCard).toBeVisible();

		await clickCardBackground(page, newCard);
		await expect(page).toHaveURL(/\/boards\/[^/]+\/cards\/[^/]+/);
		const panel = page.locator('[data-testid="card-panel"]');
		await expect(panel).toBeVisible();
		await panel.locator('.card-panel-description-empty').click();
		await panel.locator('#card-panel-description').fill('Share with the team.');
		await panel.locator('.card-panel-title').click();
		await expect(newCard.locator('[data-testid="card-meta-description"]')).toBeVisible();

		page.once('dialog', (dialog) => dialog.accept());
		await panel.getByTestId('card-panel-menu').click();
		await panel.getByRole('button', { name: 'Delete card' }).click();
		await expect(
			backlogList.locator('[data-testid="card"]', { hasText: 'Draft launch notes' }),
		).toHaveCount(0);
	} finally {
		if (listId) {
			await apiDelete(page.request, apiBaseUrl, `/api/lists/${listId}`);
		}
		if (boardId) {
			await apiDelete(page.request, apiBaseUrl, `/api/boards/${boardId}`);
		}
	}
});

// TODO: AGENT SHOULD REFACTOR THIS TO api-helpers.ts AND REMOVE DUPLICATION
async function apiPost(
	request: APIRequestContext,
	apiBaseUrl: string,
	path: string,
	payload: Record<string, unknown>,
): Promise<void> {
	const response = await request.post(`${apiBaseUrl}${path}`, { data: payload });
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`POST ${path} failed: ${response.status()} ${body}`);
	}
}

async function apiGet<T>(
	request: APIRequestContext,
	apiBaseUrl: string,
	path: string,
): Promise<T> {
	const response = await request.get(`${apiBaseUrl}${path}`);
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`GET ${path} failed: ${response.status()} ${body}`);
	}
	return (await response.json()) as T;
}

async function apiDelete(
	request: APIRequestContext,
	apiBaseUrl: string,
	path: string,
): Promise<void> {
	const response = await request.delete(`${apiBaseUrl}${path}`);
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`DELETE ${path} failed: ${response.status()} ${body}`);
	}
}