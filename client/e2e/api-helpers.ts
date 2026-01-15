import type { APIRequestContext } from '@playwright/test';

const API_BASE_URL = process.env.OSOYAH_API_BASE_URL ?? 'http://127.0.0.1:9876';

export function randomSuffix(): string {
	return Math.random().toString(36).slice(2, 6);
}

export async function createBoardAndFetchId(
	request: APIRequestContext,
	title: string,
): Promise<string> {
	await apiPost(request, '/api/boards', { title });
	const boards = await apiGet<{ boards: Array<{ id: string; title: string }> }>(
		request,
		'/api/boards',
	);
	const board = boards.boards.find((item) => item.title === title);
	if (!board) {
		throw new Error(`Board "${title}" not found after creation.`);
	}
	return board.id;
}

export async function createListAndFetchId(
	request: APIRequestContext,
	boardId: string,
	title: string,
	isProcessDone = false,
): Promise<string> {
	await apiPost(request, `/api/boards/${boardId}/lists`, {
		title,
		isProcessDone,
	});
	const board = await apiGet<{ lists: Array<{ id: string; title: string }> }>(
		request,
		`/api/boards/${boardId}`,
	);
	const list = board.lists.find((item) => item.title === title);
	if (!list) {
		throw new Error(`List "${title}" not found after creation.`);
	}
	return list.id;
}

export async function createCardAndAttach(
	request: APIRequestContext,
	listId: string,
	title: string,
	description = '',
): Promise<string> {
	const cardId = await createCard(request, title, description);
	await attachCardToList(request, listId, cardId);
	return cardId;
}

export async function createCardRelationship(
	request: APIRequestContext,
	parentCardId: string,
	childCardId: string,
): Promise<void> {
	await apiPost(request, `/api/cards/${parentCardId}/relationships`, {
		childCardId,
	});
}

export async function createBoardRelationship(
	request: APIRequestContext,
	parentBoardId: string,
	childBoardId: string,
): Promise<void> {
	await apiPost(request, `/api/boards/${parentBoardId}/relationships`, {
		childBoardId,
	});
}

export async function createCard(
	request: APIRequestContext,
	title: string,
	description = '',
): Promise<string> {
	const card = await apiPost<{ id: string }>(request, '/api/cards', { title, description });
	return card.id;
}

export async function attachCardToList(
	request: APIRequestContext,
	listId: string,
	cardId: string,
): Promise<void> {
	await apiPost(request, `/api/lists/${listId}/cards`, { cardId });
}

export async function deleteList(request: APIRequestContext, listId: string): Promise<void> {
	await apiDelete(request, `/api/lists/${listId}`);
}

export async function deleteBoard(request: APIRequestContext, boardId: string): Promise<void> {
	// console.log(`Deleting boardId: ${boardId}`);
	await apiDelete(request, `/api/boards/${boardId}`);
}

export async function apiGet<T>(request: APIRequestContext, path: string): Promise<T> {
	const response = await request.get(`${API_BASE_URL}${path}`);
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`GET ${path} failed: ${response.status()} ${body}`);
	}
	return (await response.json()) as T;
}

export async function apiPost<T = unknown>(
	request: APIRequestContext,
	path: string,
	payload: Record<string, unknown>,
): Promise<T> {
	const response = await request.post(`${API_BASE_URL}${path}`, { data: payload });
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`POST ${path} failed: ${response.status()} ${body}`);
	}
	return (await response.json()) as T;
}

export async function apiDelete(request: APIRequestContext, path: string): Promise<void> {
	// console.log(`API DELETE URL: ${API_BASE_URL}${path}`);
	const response = await request.delete(`${API_BASE_URL}${path}`);
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(`DELETE ${path} failed: ${response.status()} ${body}`);
	}
}
