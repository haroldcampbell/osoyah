import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Board, BoardList, Card } from '../models/board.model';
import { BoardService } from '../services/board.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
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

  private idCounter = 0;
  private readonly boardService = inject(BoardService);
  private readonly destroyRef = inject(DestroyRef);

  get cardDropListIds(): string[] {
    return this.board ? this.board.lists.map((list) => list.id) : [];
  }

  ngOnInit(): void {
    this.boardService
      .getBoards()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (boards) => {
          this.board = boards[0] ?? this.createEmptyBoard();
          this.loading = false;
        },
        error: () => {
          this.error = 'Unable to load board data.';
          this.loading = false;
        },
      });
  }

  trackByListId(_: number, list: BoardList): string {
    return list.id;
  }

  trackByCardId(_: number, card: Card): string {
    return card.id;
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

    if (!window.confirm(`Remove "${list.title}" and all cards?`)) {
      return;
    }

    this.board.lists = this.board.lists.filter((item) => item.id !== list.id);
    delete this.newCardTitles[list.id];
  }

  addCard(list: BoardList): void {
    const title = (this.newCardTitles[list.id] ?? '').trim();
    if (!title) {
      return;
    }

    list.cards.push({
      id: this.createId('card'),
      title,
      description: '',
    });
    this.newCardTitles[list.id] = '';
  }

  startCardEdit(list: BoardList, card: Card): void {
    this.editingCard = { listId: list.id, cardId: card.id };
    this.editingCardTitle = card.title;
    this.editingCardDescription = card.description ?? '';
  }

  saveCardEdit(list: BoardList, card: Card): void {
    const title = this.editingCardTitle.trim();
    if (!title) {
      return;
    }

    card.title = title;
    card.description = this.editingCardDescription.trim();
    this.cancelCardEdit();
  }

  cancelCardEdit(): void {
    this.editingCard = null;
    this.editingCardTitle = '';
    this.editingCardDescription = '';
  }

  removeCard(list: BoardList, card: Card): void {
    if (!window.confirm(`Remove "${card.title}"?`)) {
      return;
    }

    list.cards = list.cards.filter((item) => item.id !== card.id);
  }

  isEditingCard(list: BoardList, card: Card): boolean {
    return this.editingCard?.listId === list.id && this.editingCard?.cardId === card.id;
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
}
