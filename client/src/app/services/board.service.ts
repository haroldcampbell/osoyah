import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable, take } from 'rxjs';

import { Board, BoardList, Card, CardComment, BoardsResponse } from '../models/board.model';
import { BoardGalleryStateService } from './board-gallery-state.service';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly dataUrl = 'assets/data.json';
  private readonly http = inject(HttpClient);
  private readonly boardGalleryState = inject(BoardGalleryStateService);
  private idCounter = 0;
  private hasLoaded = false;
  private readonly boardLoadedSubject = new BehaviorSubject(false);
  readonly boardLoaded$ = this.boardLoadedSubject.asObservable();
  now = new Date();
  private readonly clockId = window.setInterval(() => {
    this.now = new Date();
  }, 60000);

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

  editingListId: string | null = null;
  editingListTitle = '';

  editingCard: { listId: string; cardId: string } | null = null;
  editingCardTitle = '';
  editingCardDescription = '';

  selectedCard: { listId: string; cardId: string } | null = null;
  panelCardTitle = '';
  panelCardDescription = '';
  panelCommentDraft = '';

  getBoardData(): Observable<BoardsResponse> {
    return this.http.get<BoardsResponse>(this.dataUrl);
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
    this.getBoardData()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.cardsById = this.indexCards(data.cards ?? []);
          const boards = data.boards ?? [];
          const lastOpened = this.boardGalleryState.getLastOpenedMap();
          this.lastActiveAt = { ...lastOpened };
          boards.forEach((board) => {
            if (!board.createdAt) {
              board.createdAt = new Date().toISOString();
            }
          });
          if (boards.length === 0) {
            this.board = this.createEmptyBoard();
            this.boards = [this.board];
          } else {
            this.boards = boards;
            this.board = boards.find((board) => !board.archived) ?? boards[0];
          }
          this.initializeBoardOrders();
          if (this.board && recordActivity) {
            this.recordBoardActivity(this.board.id);
          }
          this.closeCardPanel();
          this.loading = false;
          this.hasLoaded = true;
          this.boardLoadedSubject.next(true);
        },
        error: () => {
          this.error = 'Unable to load board data.';
          this.loading = false;
          this.boardLoadedSubject.next(true);
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
  }

  createBoard(title: string): { success: boolean; error?: string; board?: Board } {
    const error = this.getBoardTitleError(title);
    if (error) {
      return { success: false, error };
    }
    const listId = this.createId('list');
    const now = new Date().toISOString();
    const board: Board = {
      id: this.createId('board'),
      title: title.trim(),
      createdAt: now,
      description: '',
      lists: [
        {
          id: listId,
          title: 'Tasks',
          cardIds: [],
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
    return { success: true, board };
  }

  updateBoardSettings(
    boardId: string,
    title: string,
    description: string,
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
    board.title = title.trim();
    board.description = description.trim();
    return { success: true };
  }

  deleteBoard(boardId: string): { success: boolean; error?: string } {
    const boardIndex = this.boards.findIndex((board) => board.id === boardId);
    if (boardIndex === -1) {
      return { success: false, error: 'Board not found.' };
    }
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
    board.pinned = true;
    this.removeBoardFromOrders(boardId);
    this.pinnedOrder.unshift(boardId);
  }

  unpinBoard(boardId: string): void {
    const board = this.getBoard(boardId);
    if (!board) {
      return;
    }
    board.pinned = false;
    this.pinnedOrder = this.pinnedOrder.filter((id) => id !== boardId);
    if (!board.archived) {
      this.boardOrder.unshift(boardId);
    }
  }

  archiveBoard(boardId: string): void {
    const board = this.getBoard(boardId);
    if (!board || board.archived) {
      return;
    }
    board.archived = true;
    board.pinned = false;
    this.removeBoardFromOrders(boardId);
    this.archivedOrder.unshift(boardId);
    if (this.board?.id === boardId) {
      this.board = this.getNextActiveBoard();
      this.closeCardPanel();
    }
  }

  restoreBoard(boardId: string): void {
    const board = this.getBoard(boardId);
    if (!board) {
      return;
    }
    board.archived = false;
    this.archivedOrder = this.archivedOrder.filter((id) => id !== boardId);
    this.boardOrder.unshift(boardId);
  }

  isCardOnBoard(cardId: string, boardId: string): boolean {
    const board = this.getBoard(boardId);
    if (!board) {
      return false;
    }
    return board.lists.some((list) => list.cardIds.includes(cardId));
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

    this.board.lists.push({
      id: this.createId('list'),
      title,
      cardIds: [],
    });
    this.newListTitle = '';
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

    list.title = title;
    this.cancelListEdit();
  }

  cancelListEdit(): void {
    this.editingListId = null;
    this.editingListTitle = '';
  }

  removeList(list: BoardList): void {
    if (!this.board) {
      return;
    }

    this.board.lists = this.board.lists.filter((item) => item.id !== list.id);
    delete this.newCardTitles[list.id];
    if (this.selectedCard?.listId === list.id) {
      this.closeCardPanel();
    }
  }

  addCard(list: BoardList): { success: boolean; error?: string; card?: Card } {
    const title = (this.newCardTitles[list.id] ?? '').trim();
    const error = this.getCardTitleError(title);
    if (error) {
      return { success: false, error };
    }

    const now = new Date().toISOString();
    const card: Card = {
      id: this.createId('card'),
      title,
      description: '',
      createdAt: now,
      updatedAt: now,
      comments: [],
    };
    this.cardsById[card.id] = card;
    list.cardIds.push(card.id);
    this.newCardTitles[list.id] = '';
    return { success: true, card };
  }

  startCardEdit(list: BoardList, card: Card): void {
    this.cancelListEdit();
    this.editingCard = { listId: list.id, cardId: card.id };
    this.editingCardTitle = card.title;
    this.editingCardDescription = card.description;
  }

  saveCardEdit(
    list: BoardList,
    card: Card,
  ): { success: boolean; error?: string } {
    const title = this.editingCardTitle.trim();
    const error = this.getCardTitleError(title);
    if (error) {
      return { success: false, error };
    }

    card.title = title;
    card.description = this.editingCardDescription.trim();
    card.updatedAt = new Date().toISOString();
    if (this.selectedCard?.cardId === card.id) {
      this.panelCardTitle = card.title;
      this.panelCardDescription = card.description;
    }
    this.cancelCardEdit();
    return { success: true };
  }

  cancelCardEdit(): void {
    this.editingCard = null;
    this.editingCardTitle = '';
    this.editingCardDescription = '';
  }

  removeCard(list: BoardList, card: Card): void {
    list.cardIds = list.cardIds.filter((item) => item !== card.id);
    if (this.selectedCard?.cardId === card.id) {
      this.closeCardPanel();
    }
  }

  openCardPanel(list: BoardList, card: Card): void {
    this.selectedCard = { listId: list.id, cardId: card.id };
    this.panelCardTitle = card.title;
    this.panelCardDescription = card.description;
    this.panelCommentDraft = '';
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

    card.title = title;
    card.description = this.panelCardDescription.trim();
    card.updatedAt = new Date().toISOString();
    return { success: true };
  }

  saveCardPanelTitle(card: Card): { success: boolean; error?: string } {
    const title = this.panelCardTitle.trim();
    const error = this.getCardTitleError(title);
    if (error) {
      return { success: false, error };
    }

    card.title = title;
    card.updatedAt = new Date().toISOString();
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
    };
    card.comments.push(comment);
    card.updatedAt = now;
  }

  removeComment(card: Card, comment: CardComment): void {
    card.comments = card.comments.filter((item) => item.id !== comment.id);
    card.updatedAt = new Date().toISOString();
  }

  dropList(event: CdkDragDrop<BoardList[]>): void {
    if (!this.board) {
      return;
    }

    moveItemInArray(this.board.lists, event.previousIndex, event.currentIndex);
  }

  dropCard(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  private createEmptyBoard(): Board {
    return {
      id: 'board-empty',
      title: 'New Board',
      createdAt: new Date().toISOString(),
      description: '',
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
      acc[card.id] = card;
      return acc;
    }, {});
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
