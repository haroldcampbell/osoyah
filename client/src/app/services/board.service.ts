import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { map, Observable, take } from 'rxjs';

import { Board, BoardList, Card, CardComment } from '../models/board.model';

interface BoardsResponse {
  boards: Board[];
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly dataUrl = 'assets/data.json';
  private readonly http = inject(HttpClient);
  private idCounter = 0;
  now = new Date();
  private readonly clockId = window.setInterval(() => {
    this.now = new Date();
  }, 60000);

  board: Board | null = null;
  loading = true;
  error = '';

  newListTitle = '';
  newCardTitles: Record<string, string> = {};

  editingListId: string | null = null;
  editingListTitle = '';

  editingCard: { listId: string; cardId: string } | null = null;
  editingCardTitle = '';
  editingCardDescription = '';

  selectedCard: { listId: string; cardId: string } | null = null;
  panelCardTitle = '';
  panelCardDescription = '';
  panelCommentDraft = '';

  getBoards(): Observable<Board[]> {
    return this.http.get<BoardsResponse>(this.dataUrl).pipe(map((data) => data.boards));
  }

  loadBoard(): void {
    this.loading = true;
    this.error = '';
    this.getBoards()
      .pipe(take(1))
      .subscribe({
        next: (boards) => {
          this.board = boards[0] ?? this.createEmptyBoard();
          this.closeCardPanel();
          this.loading = false;
        },
        error: () => {
          this.error = 'Unable to load board data.';
          this.loading = false;
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
      cards: [],
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

  addCard(list: BoardList): void {
    const title = (this.newCardTitles[list.id] ?? '').trim();
    if (!title) {
      return;
    }

    const now = new Date().toISOString();
    list.cards.push({
      id: this.createId('card'),
      title,
      description: '',
      createdAt: now,
      updatedAt: now,
      comments: [],
    });
    this.newCardTitles[list.id] = '';
  }

  startCardEdit(list: BoardList, card: Card): void {
    this.cancelListEdit();
    this.editingCard = { listId: list.id, cardId: card.id };
    this.editingCardTitle = card.title;
    this.editingCardDescription = card.description;
  }

  saveCardEdit(list: BoardList, card: Card): void {
    const title = this.editingCardTitle.trim();
    if (!title) {
      return;
    }

    card.title = title;
    card.description = this.editingCardDescription.trim();
    card.updatedAt = new Date().toISOString();
    if (this.selectedCard?.cardId === card.id) {
      this.panelCardTitle = card.title;
      this.panelCardDescription = card.description;
    }
    this.cancelCardEdit();
  }

  cancelCardEdit(): void {
    this.editingCard = null;
    this.editingCardTitle = '';
    this.editingCardDescription = '';
  }

  removeCard(list: BoardList, card: Card): void {
    list.cards = list.cards.filter((item) => item.id !== card.id);
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

  saveCardPanelDetails(card: Card): void {
    const title = this.panelCardTitle.trim();
    if (!title) {
      return;
    }

    card.title = title;
    card.description = this.panelCardDescription.trim();
    card.updatedAt = new Date().toISOString();
  }

  saveCardPanelTitle(card: Card): void {
    const title = this.panelCardTitle.trim();
    if (!title) {
      return;
    }

    card.title = title;
    card.updatedAt = new Date().toISOString();
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

  dropCard(event: CdkDragDrop<Card[]>): void {
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
      lists: [],
    };
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
