import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
	BehaviorSubject,
	Observable,
	Subject,
	firstValueFrom,
	retry,
	take,
	throwError,
	timer,
} from 'rxjs';

import {
	Board,
	BoardList,
	Card,
	CardComment,
	CardRelationship,
	BoardRelationship,
	BoardSummariesResponse,
	BoardSnapshotResponse,
	BoardSummary,
} from '../models/board.model';
import { BoardGalleryStateService } from './board-gallery-state.service';

export type RollupScope = 'direct' | 'descendants';

export interface RollupMetricDefinition {
	id: string;
	label: string;
	rollupFunction: 'count';
	targetProperty: 'board.cards';
	propertyFilter?: string;
}

export interface RollupMetricResult {
	id: string;
	label: string;
	value: number;
}

export type BoardViewMode = 'cards' | 'list';

export type InlineErrorScope =
	| 'board-create'
	| 'board-settings'
	| 'board-parent'
	| 'list-title'
	| 'card-create'
	| 'card-title'
	| 'card-panel-title'
	| 'card-attach'
	| 'card-parent'
	| 'card-child';

export interface InlineErrorEvent {
  scope: InlineErrorScope;
  message: string;
  boardId?: string;
  listId?: string;
  cardId?: string;
  source?: 'gallery' | 'toolbar' | 'modal';
}

interface PendingCardStatusUpdate {
  state: 'completed' | 'incomplete';
  completedAt: string | null;
  previousStatus: Card['status'];
  previousUpdatedAt: string;
  previousCommentsLength: number;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
	private readonly apiBaseUrl = '/api';
	private readonly http = inject(HttpClient);
	private readonly boardGalleryState = inject(BoardGalleryStateService);
	private idCounter = 0;
	private hasLoaded = false;
	private readonly transientRetryDelaysMs = [400, 900];
	private readonly loadErrorMessage = 'Application error. Please try again.';
	private readonly boardLoadedSubject = new BehaviorSubject(false);
	readonly boardLoaded$ = this.boardLoadedSubject.asObservable();
	private readonly toastSubject = new Subject<{ message: string; isError?: boolean }>();
	readonly toast$ = this.toastSubject.asObservable();
	private readonly inlineErrorSubject = new Subject<InlineErrorEvent>();
	readonly inlineError$ = this.inlineErrorSubject.asObservable();
	private readonly boardListLoads = new Map<string, Promise<Board | null>>();
  private readonly pendingBoardIds = new Map<string, { title: string }>();
  private readonly pendingListIds = new Map<
    string,
    { boardId: string; title: string; position: number }
  >();
  private readonly pendingCardIds = new Map<string, { listId: string }>();
  private readonly pendingCardStatusUpdates = new Map<string, PendingCardStatusUpdate>();
	now = new Date();
	private readonly clockId = window.setInterval(() => {
		this.now = new Date();
	}, 60000);
	private readonly rollupDefinitions: RollupMetricDefinition[] = [
		{
			id: 'card-total',
			label: 'Total cards',
			rollupFunction: 'count',
			targetProperty: 'board.cards',
		},
		{
			id: 'card-completed',
			label: 'Completed',
			rollupFunction: 'count',
			targetProperty: 'board.cards',
			propertyFilter: 'card.status.state == completed',
		},
	];

	board: Board | null = null;
	boards: Board[] = [];
	boardOrder: string[] = [];
	pinnedOrder: string[] = [];
	archivedOrder: string[] = [];
	lastActiveAt: Record<string, number> = {};
	loading = true;
	error = '';

	newListTitle = '';
	newCardTitles: Record<string, string> = {};
	cardsById: Record<string, Card> = {};
	cardRelationships: CardRelationship[] = [];
	boardRelationships: BoardRelationship[] = [];
	boardViewModes: Record<string, BoardViewMode> = {};

	editingListId: string | null = null;
	editingListTitle = '';

	editingCard: { listId: string; cardId: string } | null = null;
	editingCardTitle = '';
	editingCardDescription = '';

	selectedCard: { listId: string; cardId: string } | null = null;
	panelCardTitle = '';
	panelCardDescription = '';
	panelCommentDraft = '';

	private getBoardSummaries(): Observable<BoardSummariesResponse> {
		return this.http.get<BoardSummariesResponse>(`${this.apiBaseUrl}/boards`);
	}

	private getBoardSnapshot(boardId: string): Observable<BoardSnapshotResponse> {
		return this.http.get<BoardSnapshotResponse>(`${this.apiBaseUrl}/boards/${boardId}/snapshot`);
	}

	private getBoardDetails(boardId: string): Observable<Board> {
		return this.http.get<Board>(`${this.apiBaseUrl}/boards/${boardId}`);
	}

	loadBoard(options: { recordActivity?: boolean } = {}): void {
		const recordActivity = options.recordActivity ?? false;
		if (this.hasLoaded) {
			this.loading = false;
			this.error = '';
			this.boardLoadedSubject.next(true);
			return;
		}
		this.loading = true;
		this.error = '';
		this.boardLoadedSubject.next(false);
		this.withTransientRetry(this.getBoardSummaries())
			.pipe(take(1))
			.subscribe({
				next: (data) => {
					const boards = this.mapBoardSummaries(data.boards ?? []);
					const lastOpened = this.boardGalleryState.getLastOpenedMap();
					this.lastActiveAt = { ...lastOpened };
					boards.forEach((board) => {
						if (!board.createdAt) {
							board.createdAt = new Date().toISOString();
						}
						board.rollupsEnabled = board.rollupsEnabled ?? false;
						board.lists.forEach((list) => {
							list.isProcessDone = list.isProcessDone ?? false;
						});
					});
					if (boards.length === 0) {
						this.board = this.createEmptyBoard();
						this.boards = [this.board];
						this.initializeBoardOrders();
						if (this.board && recordActivity) {
							this.recordBoardActivity(this.board.id);
						}
						this.closeCardPanel();
						this.loading = false;
						this.hasLoaded = true;
						this.boardLoadedSubject.next(true);
						return;
					}
					this.boards = boards;
					this.initializeBoardOrders();
					const activeBoard = this.getNextActiveBoard();
					if (!activeBoard) {
						this.loading = false;
						this.hasLoaded = true;
						this.boardLoadedSubject.next(true);
						return;
					}
					this.board = activeBoard;
					this.loadBoardSnapshot(activeBoard.id, { recordActivity });
				},
				error: (err) => {
					this.handleLoadError(err);
				},
			});
	}

	private loadBoardSnapshot(
		boardId: string,
		options: { recordActivity?: boolean } = {},
	): void {
		const recordActivity = options.recordActivity ?? false;
		this.loading = true;
		this.error = '';
		this.boardLoadedSubject.next(false);
		this.withTransientRetry(this.getBoardSnapshot(boardId))
			.pipe(take(1))
			.subscribe({
				next: (snapshot) => {
					this.cardsById = this.indexCards(snapshot.cards ?? []);
					this.cardRelationships = snapshot.cardRelationships ?? [];
					this.boardRelationships = snapshot.boardRelationships ?? [];
					this.reconcileBoardFromServer(snapshot.board);
					this.board = this.getBoard(snapshot.board.id) ?? snapshot.board;
					if (this.board && recordActivity) {
						this.recordBoardActivity(this.board.id);
					}
					this.closeCardPanel();
					this.loading = false;
					this.hasLoaded = true;
					this.boardLoadedSubject.next(true);
				},
				error: (err) => {
					this.handleLoadError(err);
				},
			});
	}

	get cardDropListIds(): string[] {
		return this.board ? this.board.lists.map((list) => list.id) : [];
	}

	isEditingList(list: BoardList): boolean {
		return this.editingListId === list.id;
	}

	isEditingCard(list: BoardList, card: Card): boolean {
		return this.editingCard?.listId === list.id && this.editingCard?.cardId === card.id;
	}

	getBoard(boardId: string): Board | null {
		return this.boards.find((board) => board.id === boardId) ?? null;
	}

	getBoardViewMode(boardId: string | null | undefined): BoardViewMode {
		if (!boardId) {
			return 'cards';
		}
		return this.boardViewModes[boardId] ?? 'cards';
	}

	setBoardViewMode(boardId: string, mode: BoardViewMode): void {
		if (!boardId) {
			return;
		}
		this.boardViewModes[boardId] = mode;
	}

	getList(boardId: string, listId: string): BoardList | null {
		const board = this.getBoard(boardId);
		return board?.lists.find((list) => list.id === listId) ?? null;
	}

	setActiveBoard(boardId: string): void {
		const board = this.getBoard(boardId);
		if (!board) {
			return;
		}
		this.board = board;
		this.closeCardPanel();
		this.recordBoardActivity(boardId);
		this.loadBoardSnapshot(boardId);
	}

	async ensureBoardListsLoaded(boardId: string): Promise<Board | null> {
		const board = this.getBoard(boardId);
		if (!board) {
			return null;
		}
		if (board.lists.length) {
			return board;
		}
		const existingLoad = this.boardListLoads.get(boardId);
		if (existingLoad) {
			return existingLoad;
		}
		const load = (async () => {
			try {
				const serverBoard = await firstValueFrom(
					this.withTransientRetry(this.getBoardDetails(boardId)).pipe(take(1)),
				);
				this.reconcileBoardFromServer(serverBoard);
				return this.getBoard(boardId) ?? serverBoard;
			} catch (err) {
				const message = this.getErrorMessage(err, 'Unable to load board lists.');
				this.emitInlineError({ scope: 'card-attach', message, boardId });
				this.emitToast(message, true);
				return this.getBoard(boardId);
			} finally {
				this.boardListLoads.delete(boardId);
			}
		})();
		this.boardListLoads.set(boardId, load);
		return load;
	}

	private prefetchBoardLists(): void {
		this.boards.forEach((board) => {
			if (!board.lists.length) {
				void this.ensureBoardListsLoaded(board.id);
			}
		});
	}

	createBoard(
		title: string,
		options: { source?: 'gallery' | 'toolbar' | 'modal' } = {},
	): { success: boolean; error?: string; board?: Board } {
		const error = this.getBoardTitleError(title);
		if (error) {
			return { success: false, error };
		}
		const listId = this.createId('list');
		const now = new Date().toISOString();
		const tempBoardId = this.createId('board');
		const board: Board = {
			id: tempBoardId,
			title: title.trim(),
			createdAt: now,
			description: '',
			rollupsEnabled: false,
			lists: [
				{
					id: listId,
					title: 'Tasks',
					cardIds: [],
					isProcessDone: false,
				},
			],
			pinned: false,
			archived: false,
		};
		this.boards.push(board);
		this.boardOrder.unshift(board.id);
		this.board = board;
		this.recordBoardActivity(board.id);
		this.closeCardPanel();
		this.pendingBoardIds.set(board.id, { title: board.title });
		const source = options.source ?? 'toolbar';
		this.http
			.post<Board>(`${this.apiBaseUrl}/boards`, {
				title: board.title,
				description: board.description ?? '',
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					const boardIndex = this.boards.findIndex((item) => item.id === tempBoardId);
					if (boardIndex === -1) {
						return;
					}
					this.pendingBoardIds.delete(tempBoardId);
					this.replaceBoardId(tempBoardId, serverBoard.id);
					const existing = this.boards[boardIndex];
					const reconciled: Board = {
						...existing,
						...serverBoard,
						lists: existing.lists,
					};
					this.boards[boardIndex] = reconciled;
					if (this.board?.id === serverBoard.id) {
						this.board = reconciled;
					}
					const defaultList = reconciled.lists[0];
					if (!defaultList) {
						return;
					}
					this.pendingListIds.set(defaultList.id, {
						boardId: serverBoard.id,
						title: defaultList.title,
						position: 0,
					});
					this.http
						.post<Board>(`${this.apiBaseUrl}/boards/${serverBoard.id}/lists`, {
							title: defaultList.title,
							isProcessDone: defaultList.isProcessDone,
						})
						.pipe(take(1))
						.subscribe({
							next: (boardResponse) => {
								this.reconcileBoardFromServer(boardResponse);
								this.pendingListIds.delete(defaultList.id);
							},
							error: (err) => {
								const message = this.getErrorMessage(err, 'Unable to create list.');
								this.emitInlineError({
									scope: 'list-title',
									message,
									boardId: serverBoard.id,
									listId: defaultList.id,
								});
								this.emitToast(message, true);
							},
						});
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to create board.');
					const boardIndex = this.boards.findIndex((item) => item.id === tempBoardId);
					if (boardIndex !== -1) {
						this.boards.splice(boardIndex, 1);
						this.boardOrder = this.boardOrder.filter((id) => id !== tempBoardId);
					}
					if (this.board?.id === tempBoardId) {
						this.board = this.boards[0] ?? null;
					}
					this.pendingBoardIds.delete(tempBoardId);
					this.emitInlineError({ scope: 'board-create', message, source });
					this.emitToast(message, true);
				},
			});
		return { success: true, board };
	}

	updateBoardSettings(
		boardId: string,
		title: string,
		description: string,
		rollupsEnabled: boolean,
	): { success: boolean; error?: string } {
		const board = this.getBoard(boardId);
		if (!board) {
			return { success: false, error: 'Board not found.' };
		}
		const error = this.getBoardTitleError(title);
		if (error) {
			return { success: false, error };
		}
		const descriptionError = this.getBoardDescriptionError(description);
		if (descriptionError) {
			return { success: false, error: descriptionError };
		}
		const previous = this.cloneBoard(board);
		board.title = title.trim();
		board.description = description.trim();
		board.rollupsEnabled = rollupsEnabled;
		this.http
			.patch<Board>(`${this.apiBaseUrl}/boards/${boardId}`, {
				title: board.title,
				description: board.description ?? '',
				rollupsEnabled,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					this.reconcileBoardFromServer(serverBoard);
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to update board.');
					const boardIndex = this.boards.findIndex((item) => item.id === boardId);
					if (boardIndex !== -1) {
						this.boards[boardIndex] = previous;
					}
					if (this.board?.id === boardId) {
						this.board = previous;
					}
					this.emitInlineError({ scope: 'board-settings', message, boardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	getDoneLists(boardId?: string): BoardList[] {
		const board = boardId ? this.getBoard(boardId) : this.board;
		if (!board) {
			return [];
		}
		return board.lists.filter((list) => list.isProcessDone);
	}

	setListProcessDone(
		boardId: string,
		listId: string,
		isProcessDone: boolean,
	): { success: boolean; error?: string } {
		const board = this.getBoard(boardId);
		if (!board) {
			return { success: false, error: 'Board not found.' };
		}
		const list = board.lists.find((item) => item.id === listId);
		if (!list) {
			return { success: false, error: 'List not found.' };
		}
		const previous = { ...list };
		list.isProcessDone = isProcessDone;
		this.http
			.patch<Board>(`${this.apiBaseUrl}/lists/${listId}`, {
				isProcessDone,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					this.reconcileBoardFromServer(serverBoard);
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to update list.');
					const boardSnapshot = this.getBoard(boardId);
					if (boardSnapshot) {
						const rollbackList = boardSnapshot.lists.find((item) => item.id === listId);
						if (rollbackList) {
							rollbackList.isProcessDone = previous.isProcessDone;
						}
					}
					this.emitInlineError({ scope: 'list-title', message, boardId, listId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	getBoardRollupMetrics(boardId: string, scope: RollupScope): RollupMetricResult[] {
		const cards = this.getCardsForRollupScope(boardId, scope);
		return this.rollupDefinitions.map((definition) => ({
			id: definition.id,
			label: definition.label,
			value: this.applyRollupDefinition(definition, cards),
		}));
	}

	deleteBoard(boardId: string): { success: boolean; error?: string } {
		const boardIndex = this.boards.findIndex((board) => board.id === boardId);
		if (boardIndex === -1) {
			return { success: false, error: 'Board not found.' };
		}
		const boardSnapshot = this.cloneBoard(this.boards[boardIndex]);
		const boardOrderSnapshot = [...this.boardOrder];
		const pinnedOrderSnapshot = [...this.pinnedOrder];
		const archivedOrderSnapshot = [...this.archivedOrder];
		const lastActiveSnapshot = this.lastActiveAt[boardId];
		this.removeBoardFromOrders(boardId);
		this.boardGalleryState.removeBoard(boardId);
		delete this.lastActiveAt[boardId];
		this.boards.splice(boardIndex, 1);
		if (!this.boards.length) {
			const emptyBoard = this.createEmptyBoard();
			this.boards.push(emptyBoard);
			this.board = emptyBoard;
			this.initializeBoardOrders();
			this.closeCardPanel();
			return { success: true };
		}
		if (this.board?.id === boardId) {
			this.board = this.getNextActiveBoard();
			this.closeCardPanel();
		}
		this.http
			.delete(`${this.apiBaseUrl}/boards/${boardId}`)
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to delete board.');
					this.boards.splice(boardIndex, 0, boardSnapshot);
					this.boardOrder = boardOrderSnapshot;
					this.pinnedOrder = pinnedOrderSnapshot;
					this.archivedOrder = archivedOrderSnapshot;
					if (lastActiveSnapshot !== undefined) {
						this.lastActiveAt[boardId] = lastActiveSnapshot;
						this.boardGalleryState.setLastOpened(boardId, lastActiveSnapshot);
					}
					if (!this.board || this.board.id !== boardId) {
						this.board = this.board ?? boardSnapshot;
					}
					this.emitInlineError({ scope: 'board-settings', message, boardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	setBoardOrder(order: string[]): void {
		const available = this.boards
			.filter((board) => !board.archived && !board.pinned)
			.map((board) => board.id);
		const normalized = order.filter((boardId) => available.includes(boardId));
		const missing = available.filter((boardId) => !normalized.includes(boardId));
		this.boardOrder = [...normalized, ...missing];
	}

	setPinnedOrder(order: string[]): void {
		const available = this.boards
			.filter((board) => !board.archived && board.pinned)
			.map((board) => board.id);
		const normalized = order.filter((boardId) => available.includes(boardId));
		const missing = available.filter((boardId) => !normalized.includes(boardId));
		this.pinnedOrder = [...normalized, ...missing];
	}

	pinBoard(boardId: string): void {
		const board = this.getBoard(boardId);
		if (!board || board.archived) {
			return;
		}
		const previous = { pinned: board.pinned ?? false, archived: board.archived ?? false };
		const orderSnapshot = {
			boardOrder: [...this.boardOrder],
			pinnedOrder: [...this.pinnedOrder],
			archivedOrder: [...this.archivedOrder],
		};
		board.pinned = true;
		this.removeBoardFromOrders(boardId);
		this.pinnedOrder.unshift(boardId);
		this.syncBoardFlags(boardId, previous, orderSnapshot);
	}

	unpinBoard(boardId: string): void {
		const board = this.getBoard(boardId);
		if (!board) {
			return;
		}
		const previous = { pinned: board.pinned ?? false, archived: board.archived ?? false };
		const orderSnapshot = {
			boardOrder: [...this.boardOrder],
			pinnedOrder: [...this.pinnedOrder],
			archivedOrder: [...this.archivedOrder],
		};
		board.pinned = false;
		this.pinnedOrder = this.pinnedOrder.filter((id) => id !== boardId);
		if (!board.archived) {
			this.boardOrder.unshift(boardId);
		}
		this.syncBoardFlags(boardId, previous, orderSnapshot);
	}

	archiveBoard(boardId: string): void {
		const board = this.getBoard(boardId);
		if (!board || board.archived) {
			return;
		}
		const previous = { pinned: board.pinned ?? false, archived: board.archived ?? false };
		const orderSnapshot = {
			boardOrder: [...this.boardOrder],
			pinnedOrder: [...this.pinnedOrder],
			archivedOrder: [...this.archivedOrder],
		};
		board.archived = true;
		board.pinned = false;
		this.removeBoardFromOrders(boardId);
		this.archivedOrder.unshift(boardId);
		if (this.board?.id === boardId) {
			this.board = this.getNextActiveBoard();
			this.closeCardPanel();
		}
		this.syncBoardFlags(boardId, previous, orderSnapshot);
	}

	restoreBoard(boardId: string): void {
		const board = this.getBoard(boardId);
		if (!board) {
			return;
		}
		const previous = { pinned: board.pinned ?? false, archived: board.archived ?? false };
		const orderSnapshot = {
			boardOrder: [...this.boardOrder],
			pinnedOrder: [...this.pinnedOrder],
			archivedOrder: [...this.archivedOrder],
		};
		board.archived = false;
		this.archivedOrder = this.archivedOrder.filter((id) => id !== boardId);
		this.boardOrder.unshift(boardId);
		this.syncBoardFlags(boardId, previous, orderSnapshot);
	}

	isCardOnBoard(cardId: string, boardId: string): boolean {
		const board = this.getBoard(boardId);
		if (!board) {
			return false;
		}
		return board.lists.some((list) => list.cardIds.includes(cardId));
	}

	isCardOnAnyBoard(cardId: string): boolean {
		return this.boards.some((board) => this.isCardOnBoard(cardId, board.id));
	}

	addCardToBoard(
		cardId: string,
		boardId: string,
		listId: string,
	): { success: boolean; error?: string } {
		const card = this.getCard(cardId);
		if (!card) {
			return { success: false, error: 'Card not found.' };
		}
		const board = this.getBoard(boardId);
		if (!board) {
			return { success: false, error: 'Board not found.' };
		}
		if (board.lists.length === 0) {
			return { success: false, error: 'Board has no lists.' };
		}
		if (this.isCardOnBoard(cardId, boardId)) {
			return { success: false, error: 'Card already on this board.' };
		}
		const list = board.lists.find((item) => item.id === listId);
		if (!list) {
			return { success: false, error: 'List not found.' };
		}

		list.cardIds.push(card.id);
		this.http
			.post(`${this.apiBaseUrl}/lists/${listId}/cards`, { cardId })
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to add card to board.');
					list.cardIds = list.cardIds.filter((id) => id !== cardId);
					this.emitInlineError({ scope: 'card-attach', message, cardId, listId, boardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	getCard(cardId: string): Card | null {
		return this.cardsById[cardId] ?? null;
	}

	getCardFromList(list: BoardList, cardId: string): Card | null {
		if (!list.cardIds.includes(cardId)) {
			return null;
		}
		return this.getCard(cardId);
	}

	addList(): void {
		if (!this.board) {
			return;
		}

		const title = this.newListTitle.trim();
		if (!title) {
			return;
		}

		const listId = this.createId('list');
		const list: BoardList = {
			id: listId,
			title,
			cardIds: [],
			isProcessDone: false,
		};
		this.board.lists.push(list);
		this.newListTitle = '';
		this.pendingListIds.set(listId, {
			boardId: this.board.id,
			title,
			position: this.board.lists.length - 1,
		});
		this.http
			.post<Board>(`${this.apiBaseUrl}/boards/${this.board.id}/lists`, {
				title,
				isProcessDone: false,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					this.reconcileBoardFromServer(serverBoard);
					this.pendingListIds.delete(listId);
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to add list.');
					const board = this.getBoard(this.board?.id ?? '');
					if (board) {
						board.lists = board.lists.filter((item) => item.id !== listId);
					}
					this.pendingListIds.delete(listId);
					this.emitInlineError({ scope: 'list-title', message, listId, boardId: this.board?.id });
					this.emitToast(message, true);
				},
			});
	}

	startListEdit(list: BoardList): void {
		this.closeCardPanel();
		this.cancelCardEdit();
		this.editingListId = list.id;
		this.editingListTitle = list.title;
	}

	saveListEdit(list: BoardList): void {
		const title = this.editingListTitle.trim();
		if (!title) {
			return;
		}
		const previous = { ...list };
		list.title = title;
		this.cancelListEdit();
		this.http
			.patch<Board>(`${this.apiBaseUrl}/lists/${list.id}`, {
				title,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					this.reconcileBoardFromServer(serverBoard);
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to update list.');
					list.title = previous.title;
					this.emitInlineError({ scope: 'list-title', message, listId: list.id });
					this.emitToast(message, true);
				},
			});
	}

	cancelListEdit(): void {
		this.editingListId = null;
		this.editingListTitle = '';
	}

	removeList(list: BoardList): void {
		if (!this.board) {
			return;
		}
		const boardId = this.board.id;
		const listIndex = this.board.lists.findIndex((item) => item.id === list.id);
		const listSnapshot = { ...list, cardIds: [...list.cardIds] };
		this.board.lists = this.board.lists.filter((item) => item.id !== list.id);
		delete this.newCardTitles[list.id];
		if (this.selectedCard?.listId === list.id) {
			this.closeCardPanel();
		}
		this.http
			.delete(`${this.apiBaseUrl}/lists/${list.id}`)
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to remove list.');
					const board = this.getBoard(boardId);
					if (board) {
						board.lists.splice(listIndex, 0, listSnapshot);
					}
					this.emitInlineError({ scope: 'list-title', message, listId: list.id, boardId });
					this.emitToast(message, true);
				},
			});
	}

	addCard(list: BoardList): { success: boolean; error?: string; card?: Card } {
		const title = (this.newCardTitles[list.id] ?? '').trim();
		const error = this.getCardTitleError(title);
		if (error) {
			return { success: false, error };
		}

		const now = new Date().toISOString();
		const tempCardId = this.createId('card');
		const card: Card = {
			id: tempCardId,
			title,
			description: '',
			createdAt: now,
			updatedAt: now,
			comments: [],
			status: {
				state: list.isProcessDone ? 'completed' : 'incomplete',
				completedAt: list.isProcessDone ? now : null,
			},
		};
		this.cardsById[card.id] = card;
		list.cardIds.push(card.id);
		this.newCardTitles[list.id] = '';
		this.pendingCardIds.set(card.id, { listId: list.id });
		this.http
			.post<Card>(`${this.apiBaseUrl}/cards`, {
				title: card.title,
				description: card.description,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverCard) => {
					const previousId = tempCardId;
					this.pendingCardIds.delete(previousId);
					if (serverCard.id !== previousId) {
						this.replaceCardId(previousId, serverCard.id);
					}
					this.flushPendingCardStatusUpdate(previousId, serverCard.id);
					this.cardsById[serverCard.id] = {
						...serverCard,
						comments: serverCard.comments ?? [],
					};
					const targetListId = list.id;
					this.http
						.post(`${this.apiBaseUrl}/lists/${targetListId}/cards`, {
							cardId: serverCard.id,
						})
						.pipe(take(1))
						.subscribe({
							next: () => {
								if (!list.isProcessDone) {
									return;
								}
								const completedAt = card.status.completedAt ?? new Date().toISOString();
								this.http
									.patch<Card>(`${this.apiBaseUrl}/cards/${serverCard.id}`, {
										statusState: 'completed',
										completedAt,
									})
									.pipe(take(1))
									.subscribe({
										next: (updatedCard) => {
											this.cardsById[updatedCard.id] = {
												...updatedCard,
												comments: updatedCard.comments ?? [],
											};
										},
										error: (err) => {
											const message = this.getErrorMessage(err, 'Unable to update card status.');
											this.emitToast(message, true);
										},
									});
							},
							error: (err) => {
								const message = this.getErrorMessage(err, 'Unable to add card to list.');
								const targetList = this.board?.lists.find((item) => item.id === targetListId);
								if (targetList) {
									targetList.cardIds = targetList.cardIds.filter((id) => id !== serverCard.id);
								}
								delete this.cardsById[serverCard.id];
								this.emitInlineError({
									scope: 'card-create',
									message,
									listId: targetListId,
									cardId: serverCard.id,
								});
								this.emitToast(message, true);
								this.http.delete(`${this.apiBaseUrl}/cards/${serverCard.id}`).pipe(take(1)).subscribe({
									next: () => undefined,
									error: () => undefined,
								});
							},
						});
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to add card.');
					list.cardIds = list.cardIds.filter((id) => id !== tempCardId);
					delete this.cardsById[tempCardId];
					this.pendingCardIds.delete(tempCardId);
					this.pendingCardStatusUpdates.delete(tempCardId);
					this.emitInlineError({ scope: 'card-create', message, listId: list.id });
					this.emitToast(message, true);
				},
			});
		return { success: true, card };
	}

	startCardEdit(list: BoardList, card: Card): void {
		this.cancelListEdit();
		this.editingCard = { listId: list.id, cardId: card.id };
		this.editingCardTitle = card.title;
		this.editingCardDescription = card.description;
	}

	saveCardEdit(list: BoardList, card: Card): { success: boolean; error?: string } {
		const title = this.editingCardTitle.trim();
		const error = this.getCardTitleError(title);
		if (error) {
			return { success: false, error };
		}

		const previous = this.cloneCard(card);
		card.title = title;
		card.description = this.editingCardDescription.trim();
		card.updatedAt = new Date().toISOString();
		if (this.selectedCard?.cardId === card.id) {
			this.panelCardTitle = card.title;
			this.panelCardDescription = card.description;
		}
		this.cancelCardEdit();
		this.http
			.patch<Card>(`${this.apiBaseUrl}/cards/${card.id}`, {
				title: card.title,
				description: card.description,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverCard) => {
					this.cardsById[serverCard.id] = {
						...serverCard,
						comments: serverCard.comments ?? [],
					};
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to save card title.');
					this.cardsById[card.id] = previous;
					this.panelCardTitle = previous.title;
					this.panelCardDescription = previous.description;
					this.emitInlineError({ scope: 'card-title', message, cardId: card.id, listId: list.id });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	cancelCardEdit(): void {
		this.editingCard = null;
		this.editingCardTitle = '';
		this.editingCardDescription = '';
	}

	removeCard(list: BoardList, card: Card): void {
		const listIndex = list.cardIds.findIndex((item) => item === card.id);
		const cardSnapshot = this.cloneCard(card);
		const relationshipSnapshot = [...this.cardRelationships];
		const relatedCommentLengths = new Map<string, number>();
		this.cardRelationships.forEach((relationship) => {
			if (relationship.parentCardId === card.id || relationship.childCardId === card.id) {
				const parentCard = this.getCard(relationship.parentCardId);
				if (parentCard && !relatedCommentLengths.has(parentCard.id)) {
					relatedCommentLengths.set(parentCard.id, parentCard.comments.length);
				}
				const childCard = this.getCard(relationship.childCardId);
				if (childCard && !relatedCommentLengths.has(childCard.id)) {
					relatedCommentLengths.set(childCard.id, childCard.comments.length);
				}
			}
		});
		list.cardIds = list.cardIds.filter((item) => item !== card.id);
		if (this.selectedCard?.cardId === card.id) {
			this.closeCardPanel();
		}
		const shouldDeleteCard = !this.isCardOnAnyBoard(card.id);
		if (shouldDeleteCard) {
			this.handleDeletedCardRelationships(card.id);
		}
		this.http
			.delete(`${this.apiBaseUrl}/lists/${list.id}/cards/${card.id}`)
			.pipe(take(1))
			.subscribe({
				next: () => {
					if (!shouldDeleteCard) {
						return;
					}
					this.http
						.delete(`${this.apiBaseUrl}/cards/${card.id}`)
						.pipe(take(1))
						.subscribe({
							next: () => undefined,
							error: (err) => {
								const message = this.getErrorMessage(err, 'Unable to remove card.');
								list.cardIds.splice(listIndex, 0, card.id);
								this.cardsById[card.id] = cardSnapshot;
								this.cardRelationships = relationshipSnapshot;
								relatedCommentLengths.forEach((length, cardId) => {
									const relatedCard = this.getCard(cardId);
									if (relatedCard) {
										relatedCard.comments = relatedCard.comments.slice(0, length);
									}
								});
								this.emitInlineError({
									scope: 'card-title',
									message,
									cardId: card.id,
									listId: list.id,
								});
								this.emitToast(message, true);
							},
						});
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to remove card.');
					list.cardIds.splice(listIndex, 0, card.id);
					this.cardsById[card.id] = cardSnapshot;
					this.cardRelationships = relationshipSnapshot;
					relatedCommentLengths.forEach((length, cardId) => {
						const relatedCard = this.getCard(cardId);
						if (relatedCard) {
							relatedCard.comments = relatedCard.comments.slice(0, length);
						}
					});
					this.emitInlineError({ scope: 'card-title', message, cardId: card.id, listId: list.id });
					this.emitToast(message, true);
				},
			});
	}

	openCardPanel(list: BoardList, card: Card): void {
		this.selectedCard = { listId: list.id, cardId: card.id };
		this.panelCardTitle = card.title;
		this.panelCardDescription = card.description;
		this.panelCommentDraft = '';
		this.prefetchBoardLists();
	}

	closeCardPanel(): void {
		this.selectedCard = null;
		this.panelCardTitle = '';
		this.panelCardDescription = '';
		this.panelCommentDraft = '';
	}

	saveCardPanelDetails(card: Card): { success: boolean; error?: string } {
		const title = this.panelCardTitle.trim();
		const error = this.getCardTitleError(title);
		if (error) {
			return { success: false, error };
		}

		const previous = this.cloneCard(card);
		card.title = title;
		card.description = this.panelCardDescription.trim();
		card.updatedAt = new Date().toISOString();
		this.http
			.patch<Card>(`${this.apiBaseUrl}/cards/${card.id}`, {
				title: card.title,
				description: card.description,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverCard) => {
					this.cardsById[serverCard.id] = {
						...serverCard,
						comments: serverCard.comments ?? [],
					};
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to save card details.');
					this.cardsById[card.id] = previous;
					this.panelCardTitle = previous.title;
					this.panelCardDescription = previous.description;
					this.emitInlineError({ scope: 'card-panel-title', message, cardId: card.id });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	saveCardPanelTitle(card: Card): { success: boolean; error?: string } {
		const title = this.panelCardTitle.trim();
		const error = this.getCardTitleError(title);
		if (error) {
			return { success: false, error };
		}

		const previous = this.cloneCard(card);
		card.title = title;
		card.updatedAt = new Date().toISOString();
		this.http
			.patch<Card>(`${this.apiBaseUrl}/cards/${card.id}`, {
				title: card.title,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverCard) => {
					this.cardsById[serverCard.id] = {
						...serverCard,
						comments: serverCard.comments ?? [],
					};
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to save card title.');
					this.cardsById[card.id] = previous;
					this.panelCardTitle = previous.title;
					this.emitInlineError({ scope: 'card-panel-title', message, cardId: card.id });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	addComment(card: Card, message: string): void {
		const trimmed = message.trim();
		if (!trimmed) {
			return;
		}

		const now = new Date().toISOString();
		const comment: CardComment = {
			id: this.createId('comment'),
			message: trimmed,
			createdAt: now,
			authorType: 'user',
		};
		card.comments.push(comment);
		card.updatedAt = now;
	}

	removeComment(card: Card, comment: CardComment): void {
		card.comments = card.comments.filter((item) => item.id !== comment.id);
		card.updatedAt = new Date().toISOString();
	}

	addSystemComment(cardId: string, message: string, timestamp?: string): void {
		const card = this.getCard(cardId);
		if (!card) {
			return;
		}
		const createdAt = timestamp ?? new Date().toISOString();
		const comment: CardComment = {
			id: this.createId('comment'),
			message,
			createdAt,
			authorType: 'system',
		};
		card.comments.push(comment);
		card.updatedAt = createdAt;
	}

	addCardRelationship(
		childCardId: string,
		parentCardId: string,
	): { success: boolean; error?: string; relationship?: CardRelationship } {
		const child = this.getCard(childCardId);
		if (!child) {
			return { success: false, error: 'Child card not found.' };
		}
		const parent = this.getCard(parentCardId);
		if (!parent) {
			return { success: false, error: 'Parent card not found.' };
		}
		if (childCardId === parentCardId) {
			return { success: false, error: 'A card cannot be its own parent.' };
		}
		if (this.wouldCreateCycle(childCardId, parentCardId)) {
			return { success: false, error: 'This parent would create a cycle.' };
		}
		const existingParent = this.getParentRelationship(childCardId);
		if (existingParent && existingParent.parentCardId === parentCardId) {
			return { success: false, error: 'This parent is already linked.' };
		}
		const parentCard = this.getCard(parentCardId);
		const childCard = this.getCard(childCardId);
		const parentCommentsLength = parentCard?.comments.length ?? 0;
		const childCommentsLength = childCard?.comments.length ?? 0;
		if (existingParent) {
			this.cardRelationships = this.cardRelationships.filter(
				(item) =>
					!(
						item.childCardId === existingParent.childCardId &&
						item.parentCardId === existingParent.parentCardId
					),
			);
			this.recordRelationshipUnlink(existingParent.parentCardId, existingParent.childCardId);
		}
		const relationship: CardRelationship = {
			childCardId,
			parentCardId,
			createdAt: new Date().toISOString(),
		};
		this.cardRelationships.push(relationship);
		this.recordRelationshipLink(parentCardId, childCardId);
		this.http
			.post(`${this.apiBaseUrl}/cards/${parentCardId}/relationships`, {
				childCardId,
			})
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to link parent.');
					this.cardRelationships = this.cardRelationships.filter(
						(item) =>
							!(
								item.childCardId === relationship.childCardId &&
								item.parentCardId === relationship.parentCardId
							),
					);
					if (existingParent) {
						this.cardRelationships.push(existingParent);
					}
					if (parentCard) {
						parentCard.comments = parentCard.comments.slice(0, parentCommentsLength);
					}
					if (childCard) {
						childCard.comments = childCard.comments.slice(0, childCommentsLength);
					}
					this.emitInlineError({ scope: 'card-parent', message, cardId: childCardId });
					this.emitToast(message, true);
				},
			});
		return { success: true, relationship };
	}

	unlinkParent(childCardId: string): { success: boolean; error?: string } {
		const relationship = this.getParentRelationship(childCardId);
		if (!relationship) {
			return { success: false, error: 'No parent link to remove.' };
		}
		const parentCard = this.getCard(relationship.parentCardId);
		const childCard = this.getCard(relationship.childCardId);
		const parentCommentsLength = parentCard?.comments.length ?? 0;
		const childCommentsLength = childCard?.comments.length ?? 0;
		this.cardRelationships = this.cardRelationships.filter(
			(item) =>
				!(
					item.childCardId === relationship.childCardId &&
					item.parentCardId === relationship.parentCardId
				),
		);
		this.recordRelationshipUnlink(relationship.parentCardId, relationship.childCardId);
		this.http
			.delete(
				`${this.apiBaseUrl}/cards/${relationship.parentCardId}/relationships/${relationship.childCardId}`,
			)
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to remove parent.');
					this.cardRelationships.push(relationship);
					if (parentCard) {
						parentCard.comments = parentCard.comments.slice(0, parentCommentsLength);
					}
					if (childCard) {
						childCard.comments = childCard.comments.slice(0, childCommentsLength);
					}
					this.emitInlineError({ scope: 'card-parent', message, cardId: childCardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	unlinkChild(parentCardId: string, childCardId: string): { success: boolean; error?: string } {
		const relationship = this.cardRelationships.find(
			(item) => item.parentCardId === parentCardId && item.childCardId === childCardId,
		);
		if (!relationship) {
			return { success: false, error: 'No child link to remove.' };
		}
		const parentCard = this.getCard(parentCardId);
		const childCard = this.getCard(childCardId);
		const parentCommentsLength = parentCard?.comments.length ?? 0;
		const childCommentsLength = childCard?.comments.length ?? 0;
		this.cardRelationships = this.cardRelationships.filter(
			(item) => !(item.parentCardId === parentCardId && item.childCardId === childCardId),
		);
		this.recordRelationshipUnlink(parentCardId, childCardId);
		this.http
			.delete(`${this.apiBaseUrl}/cards/${parentCardId}/relationships/${childCardId}`)
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to unlink child.');
					this.cardRelationships.push(relationship);
					if (parentCard) {
						parentCard.comments = parentCard.comments.slice(0, parentCommentsLength);
					}
					if (childCard) {
						childCard.comments = childCard.comments.slice(0, childCommentsLength);
					}
					this.emitInlineError({ scope: 'card-child', message, cardId: childCardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	getParentRelationship(childCardId: string): CardRelationship | null {
		return this.cardRelationships.find((item) => item.childCardId === childCardId) ?? null;
	}

	getParentCard(childCardId: string): Card | null {
		const relationship = this.getParentRelationship(childCardId);
		if (!relationship) {
			return null;
		}
		return this.getCard(relationship.parentCardId);
	}

	getChildRelationships(parentCardId: string): CardRelationship[] {
		return this.cardRelationships.filter((item) => item.parentCardId === parentCardId);
	}

	getChildCards(parentCardId: string): Card[] {
		return this.getChildRelationships(parentCardId)
			.map((item) => this.getCard(item.childCardId))
			.filter((card): card is Card => !!card);
	}

	getValidParentOptions(childCardId: string): Card[] {
		return this.getActiveCards().filter(
			(card) => card.id !== childCardId && !this.wouldCreateCycle(childCardId, card.id),
		);
	}

	getBoardParentId(childBoardId: string): string | null {
		return (
			this.boardRelationships.find((item) => item.childBoardId === childBoardId)?.parentBoardId ??
			null
		);
	}

	getBoardParent(childBoardId: string): Board | null {
		const parentId = this.getBoardParentId(childBoardId);
		if (!parentId) {
			return null;
		}
		return this.getBoard(parentId);
	}

	getBoardParentEligibility(
		childBoardId: string,
		parentBoardId: string | null,
		maxDepth: number,
	): { allowed: boolean; reason?: 'self' | 'cycle' | 'depth' } {
		if (parentBoardId && childBoardId === parentBoardId) {
			return { allowed: false, reason: 'self' };
		}
		const child = this.getBoard(childBoardId);
		if (!child) {
			return { allowed: false };
		}
		if (parentBoardId) {
			const parent = this.getBoard(parentBoardId);
			if (!parent) {
				return { allowed: false };
			}
		}
		const { parentByChild, childrenByParent } = this.getBoardHierarchyMaps();
		if (parentBoardId && this.wouldCreateBoardCycle(childBoardId, parentBoardId, parentByChild)) {
			return { allowed: false, reason: 'cycle' };
		}
		const subtreeHeight = this.getBoardSubtreeHeight(childBoardId, childrenByParent, new Set());
		const parentDepth = parentBoardId ? this.getBoardDepth(parentBoardId, parentByChild) : 0;
		const resultingDepth = parentDepth + 1 + subtreeHeight - 1;
		if (resultingDepth > maxDepth) {
			return { allowed: false, reason: 'depth' };
		}
		return { allowed: true };
	}

	setBoardParent(
		childBoardId: string,
		parentBoardId: string | null,
		maxDepth: number,
	): { success: boolean; error?: string } {
		const eligibility = this.getBoardParentEligibility(childBoardId, parentBoardId, maxDepth);
		if (!eligibility.allowed) {
			if (eligibility.reason === 'self') {
				return { success: false, error: 'A board cannot be its own parent.' };
			}
			if (eligibility.reason === 'cycle') {
				return { success: false, error: 'This parent would create a cycle.' };
			}
			if (eligibility.reason === 'depth') {
				return { success: false, error: `This parent would exceed depth ${maxDepth}.` };
			}
			return { success: false, error: 'Unable to set parent.' };
		}
		const existing =
			this.boardRelationships.find((item) => item.childBoardId === childBoardId) ?? null;
		const previousRelationships = [...this.boardRelationships];
		if (!parentBoardId) {
			if (!existing) {
				return { success: true };
			}
			this.boardRelationships = this.boardRelationships.filter(
				(item) => item.childBoardId !== childBoardId,
			);
			this.http
				.delete(`${this.apiBaseUrl}/boards/${existing.parentBoardId}/relationships/${childBoardId}`)
				.pipe(take(1))
				.subscribe({
					next: () => undefined,
					error: (err) => {
						const message = this.getErrorMessage(err, 'Unable to remove board parent.');
						this.boardRelationships = previousRelationships;
						this.emitInlineError({ scope: 'board-parent', message, boardId: childBoardId });
						this.emitToast(message, true);
					},
				});
			return { success: true };
		}
		if (existing?.parentBoardId === parentBoardId) {
			return { success: true };
		}
		if (existing) {
			this.boardRelationships = this.boardRelationships.filter(
				(item) => item.childBoardId !== childBoardId,
			);
		}
		this.boardRelationships.push({
			childBoardId,
			parentBoardId,
			createdAt: new Date().toISOString(),
		});
		this.http
			.post(`${this.apiBaseUrl}/boards/${parentBoardId}/relationships`, {
				childBoardId,
			})
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to set board parent.');
					this.boardRelationships = previousRelationships;
					this.emitInlineError({ scope: 'board-parent', message, boardId: childBoardId });
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	reorderBoardChildren(
		parentBoardId: string,
		orderedChildIds: string[],
	): { success: boolean; error?: string } {
		if (!parentBoardId) {
			return { success: false, error: 'Root boards cannot be reordered.' };
		}
		const relationships = this.boardRelationships.filter(
			(item) => item.parentBoardId === parentBoardId,
		);
		if (relationships.length < 2) {
			return { success: true };
		}
		if (orderedChildIds.length !== relationships.length) {
			return { success: false, error: 'Invalid reorder.' };
		}
		const relationshipByChild = new Map(
			relationships.map((relationship) => [relationship.childBoardId, relationship]),
		);
		const reordered = orderedChildIds.map((childId) => relationshipByChild.get(childId));
		if (reordered.some((item) => !item)) {
			return { success: false, error: 'Invalid reorder.' };
		}
		const remaining = this.boardRelationships.filter(
			(item) => item.parentBoardId !== parentBoardId,
		);
		this.boardRelationships = [...remaining, ...(reordered as BoardRelationship[])];
		return { success: true };
	}

	getBoardForCard(cardId: string): Board | null {
		return this.boards.find((board) => this.isCardOnBoard(cardId, board.id)) ?? null;
	}

	private emitToast(message: string, isError = false): void {
		this.toastSubject.next({ message, isError });
	}

	private emitInlineError(event: InlineErrorEvent): void {
		this.inlineErrorSubject.next(event);
	}

	private flushPendingCardStatusUpdate(previousId: string, nextId: string): void {
		const pending = this.pendingCardStatusUpdates.get(previousId);
		if (!pending) {
			return;
		}
		this.pendingCardStatusUpdates.delete(previousId);
		this.submitCardStatusUpdate(nextId, pending);
	}

	private submitCardStatusUpdate(cardId: string, update: PendingCardStatusUpdate): void {
		this.http
			.patch<Card>(`${this.apiBaseUrl}/cards/${cardId}`, {
				statusState: update.state,
				completedAt: update.completedAt,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverCard) => {
					this.cardsById[serverCard.id] = {
						...serverCard,
						comments: serverCard.comments ?? [],
					};
				},
				error: (err) => {
					const messageText = this.getErrorMessage(err, 'Unable to update card status.');
					const card = this.getCard(cardId);
					if (!card) {
						return;
					}
					card.status = update.previousStatus;
					card.updatedAt = update.previousUpdatedAt;
					card.comments = card.comments.slice(0, update.previousCommentsLength);
					this.emitToast(messageText, true);
				},
			});
	}

	private mapBoardSummaries(summaries: BoardSummary[]): Board[] {
		return summaries.map((summary) => ({
			id: summary.id,
			title: summary.title,
			createdAt: summary.createdAt,
			description: summary.description,
			rollupsEnabled: summary.rollupsEnabled,
			pinned: summary.pinned,
			archived: summary.archived,
			lists: [],
		}));
	}

	private withTransientRetry<T>(source: Observable<T>): Observable<T> {
		return source.pipe(
			retry({
				count: this.transientRetryDelaysMs.length,
				delay: (error, retryCount) => {
					if (!this.isTransientError(error)) {
						return throwError(() => error);
					}
					const delayMs = this.transientRetryDelaysMs[retryCount - 1] ?? 0;
					return timer(delayMs);
				},
			}),
		);
	}

	private isTransientError(error: unknown): boolean {
		if (!(error instanceof HttpErrorResponse)) {
			return false;
		}
		if (error.status === 0) {
			return true;
		}
		return error.status === 502 || error.status === 503 || error.status === 504;
	}

	private handleLoadError(_error: unknown): void {
		this.error = this.loadErrorMessage;
		this.loading = false;
		this.boardLoadedSubject.next(true);
	}

	private getErrorMessage(error: unknown, fallback: string): string {
		if (error instanceof HttpErrorResponse) {
			const apiMessage = error.error?.error?.message;
			if (typeof apiMessage === 'string' && apiMessage.trim()) {
				return apiMessage;
			}
		}
		return fallback;
	}

	private cloneBoard(board: Board): Board {
		return {
			...board,
			lists: board.lists.map((list) => ({
				...list,
				cardIds: [...list.cardIds],
			})),
		};
	}

	private cloneCard(card: Card): Card {
		return {
			...card,
			status: { ...card.status },
			comments: card.comments.map((comment) => ({ ...comment })),
		};
	}

	private replaceBoardId(oldId: string, nextId: string): void {
		this.boardOrder = this.boardOrder.map((id) => (id === oldId ? nextId : id));
		this.pinnedOrder = this.pinnedOrder.map((id) => (id === oldId ? nextId : id));
		this.archivedOrder = this.archivedOrder.map((id) => (id === oldId ? nextId : id));
		const lastActive = this.lastActiveAt[oldId];
		if (lastActive) {
			delete this.lastActiveAt[oldId];
			this.lastActiveAt[nextId] = lastActive;
		}
		if (this.boardViewModes[oldId]) {
			this.boardViewModes[nextId] = this.boardViewModes[oldId];
			delete this.boardViewModes[oldId];
		}
		if (this.board?.id === oldId) {
			this.board.id = nextId;
		}
	}

	private replaceListId(oldId: string, nextId: string): void {
		const value = this.newCardTitles[oldId];
		if (value !== undefined) {
			delete this.newCardTitles[oldId];
			this.newCardTitles[nextId] = value;
		}
		if (this.editingListId === oldId) {
			this.editingListId = nextId;
		}
		if (this.selectedCard?.listId === oldId) {
			this.selectedCard.listId = nextId;
		}
		if (this.editingCard?.listId === oldId) {
			this.editingCard.listId = nextId;
		}
	}

	private replaceCardId(oldId: string, nextId: string): void {
		const card = this.cardsById[oldId];
		if (card) {
			delete this.cardsById[oldId];
			this.cardsById[nextId] = { ...card, id: nextId };
		}
		this.boards.forEach((board) => {
			board.lists.forEach((list) => {
				list.cardIds = list.cardIds.map((id) => (id === oldId ? nextId : id));
			});
		});
		if (this.selectedCard?.cardId === oldId) {
			this.selectedCard.cardId = nextId;
		}
		if (this.editingCard?.cardId === oldId) {
			this.editingCard.cardId = nextId;
		}
	}

	private restoreListOrder(board: Board, order: string[]): void {
		const listById = new Map(board.lists.map((list) => [list.id, list]));
		board.lists = order.map((id) => listById.get(id)).filter((item): item is BoardList => !!item);
	}

	private restoreCardOrder(list: BoardList, order: string[]): void {
		list.cardIds = [...order];
	}

	private syncBoardFlags(
		boardId: string,
		previous: { pinned: boolean; archived: boolean },
		orderSnapshot: { boardOrder: string[]; pinnedOrder: string[]; archivedOrder: string[] },
	): void {
		const board = this.getBoard(boardId);
		if (!board) {
			return;
		}
		this.http
			.patch<Board>(`${this.apiBaseUrl}/boards/${boardId}`, {
				title: board.title,
				description: board.description ?? '',
				pinned: board.pinned,
				archived: board.archived,
				rollupsEnabled: board.rollupsEnabled ?? false,
			})
			.pipe(take(1))
			.subscribe({
				next: (serverBoard) => {
					this.reconcileBoardFromServer(serverBoard);
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to update board.');
					board.pinned = previous.pinned;
					board.archived = previous.archived;
					this.boardOrder = orderSnapshot.boardOrder;
					this.pinnedOrder = orderSnapshot.pinnedOrder;
					this.archivedOrder = orderSnapshot.archivedOrder;
					this.emitInlineError({ scope: 'board-settings', message, boardId });
					this.emitToast(message, true);
				},
			});
	}

	private reconcileBoardFromServer(serverBoard: Board): void {
		const boardIndex = this.boards.findIndex((item) => item.id === serverBoard.id);
		if (boardIndex === -1) {
			return;
		}
		const existing = this.boards[boardIndex];
		serverBoard.lists.forEach((serverList, index) => {
			const localList = existing.lists[index];
			if (localList && localList.title === serverList.title && localList.id !== serverList.id) {
				this.replaceListId(localList.id, serverList.id);
			}
		});
		const reconciled: Board = {
			...existing,
			...serverBoard,
			lists: serverBoard.lists.map((list) => ({ ...list, cardIds: [...list.cardIds] })),
		};
		this.boards[boardIndex] = reconciled;
		if (this.board?.id === serverBoard.id) {
			this.board = reconciled;
		}
	}

	private recordRelationshipLink(parentCardId: string, childCardId: string): void {
		const timestamp = new Date().toISOString();
		const parentLabel = this.formatCardMarkdown(parentCardId);
		const childLabel = this.formatCardMarkdown(childCardId);
		this.addSystemComment(childCardId, `Parent card linked: ${parentLabel}`, timestamp);
		this.addSystemComment(parentCardId, `Child card linked: ${childLabel}`, timestamp);
	}

	private recordRelationshipUnlink(parentCardId: string, childCardId: string): void {
		const timestamp = new Date().toISOString();
		const parentLabel = this.formatCardMarkdown(parentCardId);
		const childLabel = this.formatCardMarkdown(childCardId);
		this.addSystemComment(childCardId, `Parent card unlinked: ${parentLabel}`, timestamp);
		this.addSystemComment(parentCardId, `Child card unlinked: ${childLabel}`, timestamp);
	}

	private handleDeletedCardRelationships(cardId: string): void {
		const timestamp = new Date().toISOString();
		const cardLabel = this.formatCardMarkdown(cardId, { link: false });
		const childLinks = this.getChildRelationships(cardId);
		childLinks.forEach((relationship) => {
			this.addSystemComment(
				relationship.childCardId,
				`Parent card unlinked: ${cardLabel}`,
				timestamp,
			);
		});
		const parentLink = this.getParentRelationship(cardId);
		if (parentLink) {
			this.addSystemComment(
				parentLink.parentCardId,
				`Child card unlinked: ${cardLabel}`,
				timestamp,
			);
		}
		this.cardRelationships = this.cardRelationships.filter(
			(item) => item.parentCardId !== cardId && item.childCardId !== cardId,
		);
	}

	private formatCardLabel(cardId: string): string {
		const card = this.getCard(cardId);
		if (!card) {
			return `${cardId} - Unknown`;
		}
		return `${card.id} - ${card.title}`;
	}

	private formatCardMarkdown(cardId: string, options: { link?: boolean } = {}): string {
		const label = this.formatCardLabel(cardId);
		if (options.link === false) {
			return `**${label}**`;
		}
		const board = this.getBoardForCard(cardId);
		if (!board) {
			return `**${label}**`;
		}
		return `[**${label}**](/boards/${board.id}/cards/${cardId})`;
	}

	private formatBoardMarkdown(boardId: string, cardId: string): string {
		const board = this.boards.find((item) => item.id === boardId);
		if (!board) {
			return 'Board';
		}
		return `[${board.title}](/boards/${boardId}/cards/${cardId})`;
	}

	private getBoardHierarchyMaps(): {
		parentByChild: Map<string, string>;
		childrenByParent: Map<string, string[]>;
	} {
		const parentByChild = new Map<string, string>();
		const childrenByParent = new Map<string, string[]>();
		this.boardRelationships.forEach((relationship) => {
			parentByChild.set(relationship.childBoardId, relationship.parentBoardId);
			const children = childrenByParent.get(relationship.parentBoardId) ?? [];
			if (!children.includes(relationship.childBoardId)) {
				children.push(relationship.childBoardId);
				childrenByParent.set(relationship.parentBoardId, children);
			}
		});
		return { parentByChild, childrenByParent };
	}

	private wouldCreateBoardCycle(
		childBoardId: string,
		parentBoardId: string,
		parentByChild: Map<string, string>,
	): boolean {
		let currentId: string | undefined = parentBoardId;
		const visited = new Set<string>();
		while (currentId) {
			if (currentId === childBoardId) {
				return true;
			}
			if (visited.has(currentId)) {
				break;
			}
			visited.add(currentId);
			currentId = parentByChild.get(currentId);
		}
		return false;
	}

	private getBoardDepth(boardId: string, parentByChild: Map<string, string>): number {
		let depth = 1;
		let currentId: string | undefined = boardId;
		const visited = new Set<string>();
		while (currentId && parentByChild.has(currentId)) {
			if (visited.has(currentId)) {
				break;
			}
			visited.add(currentId);
			currentId = parentByChild.get(currentId);
			if (currentId) {
				depth += 1;
			}
		}
		return depth;
	}

	private getBoardSubtreeHeight(
		boardId: string,
		childrenByParent: Map<string, string[]>,
		visited: Set<string>,
	): number {
		if (visited.has(boardId)) {
			return 0;
		}
		visited.add(boardId);
		const children = childrenByParent.get(boardId) ?? [];
		if (!children.length) {
			return 1;
		}
		const childHeights = children.map((childId) =>
			this.getBoardSubtreeHeight(childId, childrenByParent, new Set(visited)),
		);
		return 1 + Math.max(...childHeights);
	}

	private wouldCreateCycle(childCardId: string, parentCardId: string): boolean {
		if (childCardId === parentCardId) {
			return true;
		}
		let currentParentId = parentCardId;
		const visited = new Set<string>();
		while (currentParentId) {
			if (visited.has(currentParentId)) {
				return true;
			}
			visited.add(currentParentId);
			const relationship = this.getParentRelationship(currentParentId);
			if (!relationship) {
				return false;
			}
			if (relationship.parentCardId === childCardId) {
				return true;
			}
			currentParentId = relationship.parentCardId;
		}
		return false;
	}

	private getActiveCards(): Card[] {
		const ids = new Set<string>();
		this.boards.forEach((board) => {
			board.lists.forEach((list) => {
				list.cardIds.forEach((cardId) => ids.add(cardId));
			});
		});
		return Array.from(ids)
			.map((cardId) => this.getCard(cardId))
			.filter((card): card is Card => !!card);
	}

	dropList(event: CdkDragDrop<BoardList[]>): void {
		if (!this.board) {
			return;
		}

		const previousOrder = this.board.lists.map((list) => list.id);
		moveItemInArray(this.board.lists, event.previousIndex, event.currentIndex);
		const boardId = this.board.id;
		const nextOrder = this.board.lists.map((list) => list.id);
		this.http
			.patch(`${this.apiBaseUrl}/boards/${boardId}/list-order`, { listIds: nextOrder })
			.pipe(take(1))
			.subscribe({
				next: () => undefined,
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to reorder lists.');
					const board = this.getBoard(boardId);
					if (board) {
						this.restoreListOrder(board, previousOrder);
					}
					this.emitToast(message, true);
				},
			});
	}

	dropCard(event: CdkDragDrop<string[]>): void {
		if (event.previousContainer === event.container) {
			const previousOrder = [...event.container.data];
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
			const listId = event.container.id;
			const nextOrder = [...event.container.data];
			this.http
				.patch(`${this.apiBaseUrl}/lists/${listId}/card-order`, { cardIds: nextOrder })
				.pipe(take(1))
				.subscribe({
					next: () => undefined,
					error: (err) => {
						const message = this.getErrorMessage(err, 'Unable to reorder cards.');
						const list = this.board?.lists.find((item) => item.id === listId);
						if (list) {
							this.restoreCardOrder(list, previousOrder);
						}
						this.emitToast(message, true);
					},
				});
			return;
		}

		const previousSourceOrder = [...event.previousContainer.data];
		const previousTargetOrder = [...event.container.data];
		const movedCardId = event.previousContainer.data[event.previousIndex];
		const movedCard = this.getCard(movedCardId);
		const previousStatus = movedCard ? { ...movedCard.status } : null;
		const previousUpdatedAt = movedCard?.updatedAt ?? null;
		const previousCommentsLength = movedCard?.comments.length ?? 0;
		const sourceListId = event.previousContainer.id;
		const targetListId = event.container.id;
		const sourceList = this.board?.lists.find((list) => list.id === sourceListId);
		const targetList = this.board?.lists.find((list) => list.id === targetListId);
		transferArrayItem(
			event.previousContainer.data,
			event.container.data,
			event.previousIndex,
			event.currentIndex,
		);
		this.recordListMoveComment(movedCardId, sourceList, targetList, this.board?.id);
		this.applyCompletionFromListMove(movedCardId, sourceList, targetList);
		this.http
			.delete(`${this.apiBaseUrl}/lists/${sourceListId}/cards/${movedCardId}`)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.http
						.post(`${this.apiBaseUrl}/lists/${targetListId}/cards`, { cardId: movedCardId })
						.pipe(take(1))
						.subscribe({
							next: () => {
								this.http
									.patch(`${this.apiBaseUrl}/lists/${sourceListId}/card-order`, {
										cardIds: event.previousContainer.data,
									})
									.pipe(take(1))
									.subscribe({ next: () => undefined, error: () => undefined });
								this.http
									.patch(`${this.apiBaseUrl}/lists/${targetListId}/card-order`, {
										cardIds: event.container.data,
									})
									.pipe(take(1))
									.subscribe({ next: () => undefined, error: () => undefined });
							},
							error: (err) => {
								const message = this.getErrorMessage(err, 'Unable to move card.');
								if (sourceList && targetList) {
									sourceList.cardIds = [...previousSourceOrder];
									targetList.cardIds = [...previousTargetOrder];
								}
								if (movedCard && previousStatus) {
									movedCard.status = previousStatus;
									movedCard.updatedAt = previousUpdatedAt ?? movedCard.updatedAt;
									movedCard.comments = movedCard.comments.slice(0, previousCommentsLength);
								}
								this.emitToast(message, true);
							},
						});
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to move card.');
					if (sourceList && targetList) {
						sourceList.cardIds = [...previousSourceOrder];
						targetList.cardIds = [...previousTargetOrder];
					}
					if (movedCard && previousStatus) {
						movedCard.status = previousStatus;
						movedCard.updatedAt = previousUpdatedAt ?? movedCard.updatedAt;
						movedCard.comments = movedCard.comments.slice(0, previousCommentsLength);
					}
					this.emitToast(message, true);
				},
			});
	}

	moveCardToList(
		cardId: string,
		sourceListId: string,
		targetListId: string,
		options: { skipStatus?: boolean } = {},
	): { success: boolean; error?: string } {
		if (!this.board) {
			return { success: false, error: 'Board not found.' };
		}
		if (sourceListId === targetListId) {
			return { success: false, error: 'Card is already in that list.' };
		}
		const sourceList = this.board.lists.find((list) => list.id === sourceListId);
		if (!sourceList) {
			return { success: false, error: 'Source list not found.' };
		}
		const targetList = this.board.lists.find((list) => list.id === targetListId);
		if (!targetList) {
			return { success: false, error: 'Target list not found.' };
		}
		if (!sourceList.cardIds.includes(cardId)) {
			return { success: false, error: 'Card is not in the source list.' };
		}

		const previousSourceOrder = [...sourceList.cardIds];
		const previousTargetOrder = [...targetList.cardIds];
		const movedCard = this.getCard(cardId);
		const previousStatus = movedCard ? { ...movedCard.status } : null;
		const previousUpdatedAt = movedCard?.updatedAt ?? null;
		const previousCommentsLength = movedCard?.comments.length ?? 0;
		const previousSelectedListId =
			this.selectedCard?.cardId === cardId ? this.selectedCard.listId : null;
		const previousEditingListId =
			this.editingCard?.cardId === cardId ? this.editingCard.listId : null;
		sourceList.cardIds = sourceList.cardIds.filter((id) => id !== cardId);
		if (!targetList.cardIds.includes(cardId)) {
			targetList.cardIds.push(cardId);
		}
		if (this.selectedCard?.cardId === cardId) {
			this.selectedCard.listId = targetList.id;
		}
		if (this.editingCard?.cardId === cardId) {
			this.editingCard.listId = targetList.id;
		}
		this.recordListMoveComment(cardId, sourceList, targetList, this.board.id);
		if (!options.skipStatus) {
			this.applyCompletionFromListMove(cardId, sourceList, targetList);
		}
		this.http
			.delete(`${this.apiBaseUrl}/lists/${sourceListId}/cards/${cardId}`)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.http
						.post(`${this.apiBaseUrl}/lists/${targetListId}/cards`, { cardId })
						.pipe(take(1))
						.subscribe({
							next: () => {
								this.http
									.patch(`${this.apiBaseUrl}/lists/${sourceListId}/card-order`, {
										cardIds: sourceList.cardIds,
									})
									.pipe(take(1))
									.subscribe({ next: () => undefined, error: () => undefined });
								this.http
									.patch(`${this.apiBaseUrl}/lists/${targetListId}/card-order`, {
										cardIds: targetList.cardIds,
									})
									.pipe(take(1))
									.subscribe({ next: () => undefined, error: () => undefined });
							},
							error: (err) => {
								const message = this.getErrorMessage(err, 'Unable to move card.');
								sourceList.cardIds = [...previousSourceOrder];
								targetList.cardIds = [...previousTargetOrder];
								if (movedCard && previousStatus) {
									movedCard.status = previousStatus;
									movedCard.updatedAt = previousUpdatedAt ?? movedCard.updatedAt;
									movedCard.comments = movedCard.comments.slice(0, previousCommentsLength);
								}
								if (previousSelectedListId && this.selectedCard?.cardId === cardId) {
									this.selectedCard.listId = previousSelectedListId;
								}
								if (previousEditingListId && this.editingCard?.cardId === cardId) {
									this.editingCard.listId = previousEditingListId;
								}
								this.emitToast(message, true);
							},
						});
				},
				error: (err) => {
					const message = this.getErrorMessage(err, 'Unable to move card.');
					sourceList.cardIds = [...previousSourceOrder];
					targetList.cardIds = [...previousTargetOrder];
					if (movedCard && previousStatus) {
						movedCard.status = previousStatus;
						movedCard.updatedAt = previousUpdatedAt ?? movedCard.updatedAt;
						movedCard.comments = movedCard.comments.slice(0, previousCommentsLength);
					}
					if (previousSelectedListId && this.selectedCard?.cardId === cardId) {
						this.selectedCard.listId = previousSelectedListId;
					}
					if (previousEditingListId && this.editingCard?.cardId === cardId) {
						this.editingCard.listId = previousEditingListId;
					}
					this.emitToast(message, true);
				},
			});
		return { success: true };
	}

	private getCardsForRollupScope(boardId: string, scope: RollupScope): Card[] {
		const boardIds = scope === 'direct' ? [boardId] : this.getDescendantBoardIds(boardId);
		const cardIds = new Set<string>();

		boardIds.forEach((id) => {
			const board = this.getBoard(id);
			if (!board) {
				return;
			}
			board.lists.forEach((list) => {
				list.cardIds.forEach((cardId) => {
					cardIds.add(cardId);
				});
			});
		});

		return Array.from(cardIds)
			.map((cardId) => this.cardsById[cardId])
			.filter((card): card is Card => !!card);
	}

	private getDescendantBoardIds(boardId: string): string[] {
		const relationships = this.boardRelationships ?? [];
		const childrenByParent = new Map<string, string[]>();

		relationships.forEach((relationship) => {
			const children = childrenByParent.get(relationship.parentBoardId) ?? [];
			if (!children.includes(relationship.childBoardId)) {
				children.push(relationship.childBoardId);
				childrenByParent.set(relationship.parentBoardId, children);
			}
		});

		const visited = new Set<string>();
		const queue = [...(childrenByParent.get(boardId) ?? [])];

		while (queue.length > 0) {
			const currentId = queue.shift();
			if (!currentId || visited.has(currentId)) {
				continue;
			}
			visited.add(currentId);
			const children = childrenByParent.get(currentId) ?? [];
			children.forEach((childId) => {
				if (!visited.has(childId)) {
					queue.push(childId);
				}
			});
		}

		return Array.from(visited);
	}

	private applyRollupDefinition(definition: RollupMetricDefinition, cards: Card[]): number {
		if (definition.rollupFunction !== 'count') {
			return 0;
		}
		if (definition.targetProperty !== 'board.cards') {
			return 0;
		}
		const filtered = this.filterCardsForRollup(definition.propertyFilter, cards);
		return filtered.length;
	}

	private filterCardsForRollup(filter: string | undefined, cards: Card[]): Card[] {
		if (!filter) {
			return cards;
		}
		if (filter === 'card.status.state == completed') {
			return cards.filter((card) => card.status.state === 'completed');
		}
		if (filter === 'card.status.state == incomplete') {
			return cards.filter((card) => card.status.state === 'incomplete');
		}
		return cards;
	}

	private createEmptyBoard(): Board {
		return {
			id: 'board-empty',
			title: 'New Board',
			createdAt: new Date().toISOString(),
			description: '',
			rollupsEnabled: false,
			lists: [],
			pinned: false,
			archived: false,
		};
	}

	private initializeBoardOrders(): void {
		this.boardOrder = [];
		this.pinnedOrder = [];
		this.archivedOrder = [];
		this.boards.forEach((board) => {
			this.lastActiveAt[board.id] = this.lastActiveAt[board.id] ?? 0;
			if (board.archived) {
				this.archivedOrder.push(board.id);
				return;
			}
			if (board.pinned) {
				this.pinnedOrder.push(board.id);
				return;
			}
			this.boardOrder.push(board.id);
		});
	}

	private removeBoardFromOrders(boardId: string): void {
		this.boardOrder = this.boardOrder.filter((id) => id !== boardId);
		this.pinnedOrder = this.pinnedOrder.filter((id) => id !== boardId);
		this.archivedOrder = this.archivedOrder.filter((id) => id !== boardId);
	}

	private getNextActiveBoard(): Board | null {
		return this.boards.find((board) => !board.archived) ?? this.boards[0] ?? null;
	}

	recordBoardActivity(boardId: string): void {
		const timestamp = Date.now();
		this.lastActiveAt[boardId] = timestamp;
		this.boardGalleryState.setLastOpened(boardId, timestamp);
	}

	getBoardTitleError(title: string): string | null {
		const trimmed = title.trim();
		if (trimmed.length < 3 || trimmed.length > 40) {
			return 'Board name must be between 3 and 40 characters.';
		}
		if (/^\d+$/.test(trimmed)) {
			return 'Board name cannot be all numbers.';
		}
		return null;
	}

	getBoardDescriptionError(description: string): string | null {
		const trimmed = description.trim();
		if (trimmed.length > 30) {
			return 'Board description must be 30 characters or less.';
		}
		return null;
	}

	getCardTitleError(title: string): string | null {
		const trimmed = title.trim();
		if (trimmed.length < 3 || trimmed.length > 90) {
			return 'Card title must be between 3 and 90 characters.';
		}
		return null;
	}

	private indexCards(cards: Card[]): Record<string, Card> {
		return cards.reduce<Record<string, Card>>((acc, card) => {
			card.comments = card.comments.map((comment) => ({
				...comment,
				authorType: comment.authorType ?? 'user',
			}));
			card.status = card.status ?? { state: 'incomplete', completedAt: null };
			acc[card.id] = card;
			return acc;
		}, {});
	}

	isCardCompleted(card: Card): boolean {
		return card.status?.state === 'completed';
	}

	setCardStatus(
		card: Card,
		state: 'completed' | 'incomplete',
		options: { source?: 'manual' | 'list'; listTitle?: string } = {},
	): boolean {
		if (card.status?.state === state) {
			return false;
		}
		const previousStatus = { ...card.status };
		const previousUpdatedAt = card.updatedAt;
		const previousCommentsLength = card.comments.length;
		const now = new Date().toISOString();
		card.status = {
			state,
			completedAt: state === 'completed' ? now : null,
		};
		card.updatedAt = now;
		const listSuffix = options.listTitle ? ` ${options.listTitle}` : '';
		const message =
			state === 'completed'
				? options.source === 'list'
					? `Card marked done (moved to${listSuffix}).`
					: 'Card marked done.'
				: options.source === 'list'
					? `Card marked incomplete (moved out of${listSuffix}).`
					: 'Card marked incomplete.';
		this.addSystemComment(card.id, message, now);
		const update: PendingCardStatusUpdate = {
			state,
			completedAt: card.status.completedAt,
			previousStatus,
			previousUpdatedAt,
			previousCommentsLength,
		};
		if (this.pendingCardIds.has(card.id)) {
			this.pendingCardStatusUpdates.set(card.id, update);
			return true;
		}
		this.submitCardStatusUpdate(card.id, update);
		return true;
	}

	getChildCompletion(parentCardId: string): { completed: number; total: number; percent: number } {
		const children = this.getChildCards(parentCardId);
		const total = children.length;
		if (total === 0) {
			return { completed: 0, total: 0, percent: 0 };
		}
		const completed = children.filter((child) => child.status?.state === 'completed').length;
		const percent = Math.floor((completed / total) * 100);
		return { completed, total, percent };
	}

	private applyCompletionFromListMove(
		cardId: string | undefined,
		sourceList?: BoardList,
		targetList?: BoardList,
	): void {
		if (!cardId || !sourceList || !targetList) {
			return;
		}
		if (sourceList.isProcessDone === targetList.isProcessDone) {
			return;
		}
		const card = this.getCard(cardId);
		if (!card) {
			return;
		}
		if (targetList.isProcessDone) {
			this.setCardStatus(card, 'completed', { source: 'list', listTitle: targetList.title });
			return;
		}
		if (sourceList.isProcessDone) {
			this.setCardStatus(card, 'incomplete', { source: 'list', listTitle: sourceList.title });
		}
	}

	private recordListMoveComment(
		cardId: string | undefined,
		sourceList?: BoardList,
		targetList?: BoardList,
		boardId?: string,
	): void {
		if (!cardId || !sourceList || !targetList) {
			return;
		}
		if (sourceList.id === targetList.id) {
			return;
		}
		if (!boardId) {
			return;
		}
		const boardLabel = this.formatBoardMarkdown(boardId, cardId);
		const message = `Card moved from ${sourceList.title} to ${targetList.title} on ${boardLabel}.`;
		this.addSystemComment(cardId, message, new Date().toISOString());
	}

	private createId(prefix: string): string {
		this.idCounter += 1;
		return `${prefix}-${Date.now()}-${this.idCounter}`;
	}

	getLastActivityIso(card: Card): string {
		const updatedAt = this.parseIsoDate(card.updatedAt);
		const createdAt = this.parseIsoDate(card.createdAt);
		if (updatedAt && createdAt && updatedAt < createdAt) {
			return card.createdAt;
		}
		return card.updatedAt || card.createdAt;
	}

	getLastActivityTooltip(card: Card): string {
		const created = this.formatExactDate(card.createdAt);
		const updated = this.formatExactDate(card.updatedAt);
		if (!created && !updated) {
			return '';
		}
		if (!created) {
			return `Updated: ${updated}`;
		}
		if (!updated) {
			return `Created: ${created}`;
		}
		return `Created: ${created} | Updated: ${updated}`;
	}

	formatRelativeTime(iso: string): string {
		const date = this.parseIsoDate(iso);
		if (!date) {
			return '';
		}
		const diffSeconds = Math.floor((this.now.getTime() - date.getTime()) / 1000);
		if (diffSeconds < 60) {
			return 'just now';
		}
		const diffMinutes = Math.floor(diffSeconds / 60);
		if (diffMinutes < 60) {
			return `${diffMinutes}m ago`;
		}
		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) {
			return `${diffHours}h ago`;
		}
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 30) {
			return `${diffDays}d ago`;
		}
		const diffMonths = Math.floor(diffDays / 30);
		if (diffMonths < 12) {
			return `${diffMonths}mo ago`;
		}
		const diffYears = Math.floor(diffMonths / 12);
		return `${diffYears}y ago`;
	}

	formatExactDate(iso: string): string {
		const date = this.parseIsoDate(iso);
		return date ? date.toLocaleString() : '';
	}

	private parseIsoDate(iso: string): Date | null {
		if (!iso) {
			return null;
		}
		const date = new Date(iso);
		return Number.isNaN(date.getTime()) ? null : date;
	}
}
