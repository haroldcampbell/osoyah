import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable, take } from 'rxjs';

import {
  Board,
  BoardList,
  Card,
  CardComment,
  CardRelationship,
  BoardRelationship,
  BoardsResponse,
} from '../models/board.model';
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
  cardRelationships: CardRelationship[] = [];
  boardRelationships: BoardRelationship[] = [];

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
          this.cardRelationships = data.cardRelationships ?? [];
          this.boardRelationships = data.boardRelationships ?? [];
          const boards = data.boards ?? [];
          const lastOpened = this.boardGalleryState.getLastOpenedMap();
          this.lastActiveAt = { ...lastOpened };
          boards.forEach((board) => {
            if (!board.createdAt) {
              board.createdAt = new Date().toISOString();
            }
            board.lists.forEach((list) => {
              list.isProcessDone = list.isProcessDone ?? false;
            });
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
      isProcessDone: false,
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
      status: {
        state: list.isProcessDone ? 'completed' : 'incomplete',
        completedAt: list.isProcessDone ? now : null,
      },
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
    if (!this.isCardOnAnyBoard(card.id)) {
      this.handleDeletedCardRelationships(card.id);
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
    if (existingParent) {
      this.unlinkParent(childCardId);
    }
    const relationship: CardRelationship = {
      childCardId,
      parentCardId,
      createdAt: new Date().toISOString(),
    };
    this.cardRelationships.push(relationship);
    this.recordRelationshipLink(parentCardId, childCardId);
    return { success: true, relationship };
  }

  unlinkParent(childCardId: string): { success: boolean; error?: string } {
    const relationship = this.getParentRelationship(childCardId);
    if (!relationship) {
      return { success: false, error: 'No parent link to remove.' };
    }
    this.cardRelationships = this.cardRelationships.filter(
      (item) =>
        !(
          item.childCardId === relationship.childCardId &&
          item.parentCardId === relationship.parentCardId
        ),
    );
    this.recordRelationshipUnlink(relationship.parentCardId, relationship.childCardId);
    return { success: true };
  }

  unlinkChild(parentCardId: string, childCardId: string): { success: boolean; error?: string } {
    const relationship = this.cardRelationships.find(
      (item) => item.parentCardId === parentCardId && item.childCardId === childCardId,
    );
    if (!relationship) {
      return { success: false, error: 'No child link to remove.' };
    }
    this.cardRelationships = this.cardRelationships.filter(
      (item) =>
        !(item.parentCardId === parentCardId && item.childCardId === childCardId),
    );
    this.recordRelationshipUnlink(parentCardId, childCardId);
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

  getBoardForCard(cardId: string): Board | null {
    return this.boards.find((board) => this.isCardOnBoard(cardId, board.id)) ?? null;
  }

  private recordRelationshipLink(parentCardId: string, childCardId: string): void {
    const timestamp = new Date().toISOString();
    const parentLabel = this.formatCardMarkdown(parentCardId);
    const childLabel = this.formatCardMarkdown(childCardId);
    this.addSystemComment(
      childCardId,
      `Parent card linked: ${parentLabel}`,
      timestamp,
    );
    this.addSystemComment(
      parentCardId,
      `Child card linked: ${childLabel}`,
      timestamp,
    );
  }

  private recordRelationshipUnlink(parentCardId: string, childCardId: string): void {
    const timestamp = new Date().toISOString();
    const parentLabel = this.formatCardMarkdown(parentCardId);
    const childLabel = this.formatCardMarkdown(childCardId);
    this.addSystemComment(
      childCardId,
      `Parent card unlinked: ${parentLabel}`,
      timestamp,
    );
    this.addSystemComment(
      parentCardId,
      `Child card unlinked: ${childLabel}`,
      timestamp,
    );
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

  private formatCardMarkdown(
    cardId: string,
    options: { link?: boolean } = {},
  ): string {
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

    moveItemInArray(this.board.lists, event.previousIndex, event.currentIndex);
  }

  dropCard(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const movedCardId = event.previousContainer.data[event.previousIndex];
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
    return { success: true };
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
