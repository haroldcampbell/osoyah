import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardService } from '../services/board.service';
import { BoardListComponent } from './list/board-list.component';
import { BoardList, Card, CardComment } from '../models/board.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, BoardListComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  readonly boardService = inject(BoardService);

  ngOnInit(): void {
    this.boardService.loadBoard();
  }

  get selectedList(): BoardList | null {
    const selection = this.boardService.selectedCard;
    if (!selection || !this.boardService.board) {
      return null;
    }
    return this.boardService.board.lists.find((list) => list.id === selection.listId) ?? null;
  }

  get selectedCard(): Card | null {
    const list = this.selectedList;
    if (!list) {
      return null;
    }
    const selection = this.boardService.selectedCard;
    return list.cards.find((card) => card.id === selection?.cardId) ?? null;
  }

  addComment(card: Card): void {
    this.boardService.addComment(card, this.boardService.panelCommentDraft);
    this.boardService.panelCommentDraft = '';
  }

  removeComment(card: Card, comment: CardComment): void {
    this.boardService.removeComment(card, comment);
  }

  saveCardDetails(card: Card): void {
    this.boardService.saveCardPanelDetails(card);
  }

  saveCardTitle(card: Card): void {
    this.boardService.saveCardPanelTitle(card);
  }

  removeSelectedCard(card: Card): void {
    const list = this.selectedList;
    if (!list) {
      return;
    }
    if (!window.confirm(`Remove "${card.title}"?`)) {
      return;
    }
    this.boardService.removeCard(list, card);
    this.closePanel();
  }

  closePanel(): void {
    this.boardService.closeCardPanel();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.boardService.cancelListEdit();
    this.boardService.cancelCardEdit();
    if (this.boardService.selectedCard) {
      this.closePanel();
    }
  }
}
