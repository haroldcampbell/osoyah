import type { APIRequestContext } from '@playwright/test';

// E2E fixtures are created per test via API calls. The seed file only bootstraps the test DB.
const API_BASE_URL = process.env.OSOYAH_API_BASE_URL ?? 'http://127.0.0.1:9876';

export type CardSeed = {
  key: string;
  title: string;
  description?: string;
};

export type ListSeed = {
  key: string;
  title: string;
  isProcessDone?: boolean;
  cards?: CardSeed[];
};

export type BoardSeed = {
  title: string;
  lists: ListSeed[];
};

export type BoardFixture = {
  boardId: string;
  listIds: Record<string, string>;
  cardIds: Record<string, string>;
  cleanup: () => Promise<void>;
};

export async function createBoardFixture(
  request: APIRequestContext,
  seed: BoardSeed,
): Promise<BoardFixture> {
  const board = await apiPost<{ id: string }>(request, '/api/boards', {
    title: seed.title,
  });
  const listIds: Record<string, string> = {};
  const cardIds: Record<string, string> = {};

  for (const list of seed.lists) {
    const listId = await createList(request, board.id, list.title, list.isProcessDone ?? false);
    listIds[list.key] = listId;
    for (const card of list.cards ?? []) {
      const created = await apiPost<{ id: string }>(request, '/api/cards', {
        title: card.title,
        description: card.description ?? '',
      });
      cardIds[card.key] = created.id;
      await apiPost(request, `/api/lists/${listId}/cards`, { cardId: created.id });
    }
  }

  return {
    boardId: board.id,
    listIds,
    cardIds,
    cleanup: async () => {
      await apiDelete(request, `/api/boards/${board.id}`);
    },
  };
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

async function createList(
  request: APIRequestContext,
  boardId: string,
  title: string,
  isProcessDone: boolean,
): Promise<string> {
  const board = await apiPost<{ lists: Array<{ id: string; title: string }> }>(
    request,
    `/api/boards/${boardId}/lists`,
    {
      title,
      isProcessDone,
    },
  );
  const match = [...board.lists].reverse().find((list) => list.title === title);
  if (!match) {
    throw new Error(`List "${title}" not found in board response.`);
  }
  return match.id;
}

async function apiPost<T = unknown>(
  request: APIRequestContext,
  path: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const response = await request.post(`${API_BASE_URL}${path}`, {
    data: payload,
  });
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`POST ${path} failed: ${response.status()} ${body}`);
  }
  return (await response.json()) as T;
}

async function apiDelete(request: APIRequestContext, path: string): Promise<void> {
  const response = await request.delete(`${API_BASE_URL}${path}`);
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`DELETE ${path} failed: ${response.status()} ${body}`);
  }
}
