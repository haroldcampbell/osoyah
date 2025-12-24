import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
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
export class BoardComponent implements OnInit, AfterViewChecked {
  readonly boardService = inject(BoardService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  commentFocused = false;
  private descriptionSaveTimeout?: number;
  private lastScrolledCardId: string | null = null;

  get commentExpanded(): boolean {
    return this.commentFocused || this.boardService.panelCommentDraft.trim().length > 0;
  }

  ngOnInit(): void {
    this.boardService.loadBoard();
  }

  ngAfterViewChecked(): void {
    if (!this.selectedCard) {
      this.lastScrolledCardId = null;
      return;
    }
    if (this.lastScrolledCardId === this.selectedCard.id) {
      return;
    }
    this.lastScrolledCardId = this.selectedCard.id;
    this.scrollSelectedCardIntoView(this.selectedCard.id);
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
    this.commentFocused = false;
  }

  removeComment(card: Card, comment: CardComment): void {
    this.boardService.removeComment(card, comment);
  }

  handleDescriptionInput(card: Card): void {
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
    }
    this.descriptionSaveTimeout = window.setTimeout(() => {
      this.boardService.saveCardPanelDetails(card);
    }, 600);
  }

  flushDescriptionSave(card: Card): void {
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
      this.descriptionSaveTimeout = undefined;
    }
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
    this.commentFocused = false;
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
      this.descriptionSaveTimeout = undefined;
    }
  }

  handleCommentFocus(): void {
    this.commentFocused = true;
  }

  handleCommentBlur(): void {
    if (!this.boardService.panelCommentDraft.trim()) {
      this.commentFocused = false;
    }
  }

  private scrollSelectedCardIntoView(cardId: string): void {
    const host = this.elementRef.nativeElement;
    const card = host.querySelector(`[data-testid="card"][data-card-id="${cardId}"]`);
    if (!card) {
      return;
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
