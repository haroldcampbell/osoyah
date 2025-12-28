import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardService } from '../services/board.service';
import { BoardListComponent } from './list/board-list.component';
import { Board, BoardList, Card, CardComment } from '../models/board.model';
import { MarkdownService } from '../services/markdown.service';

@Component({
    selector: 'app-board',
    imports: [CommonModule, FormsModule, DragDropModule, BoardListComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, AfterViewChecked {
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  @ViewChild('descriptionInput') descriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('descriptionView') descriptionView?: ElementRef<HTMLElement>;
  commentFocused = false;
  descriptionEditing = false;
  attachBoardId = '';
  attachListId = '';
  attachStatus = '';
  attachError = false;
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
    this.descriptionEditing = false;
    this.resetAttachState(this.selectedCard);
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
    if (!selection) {
      return null;
    }
    return this.boardService.getCardFromList(list, selection.cardId);
  }

  get attachBoard(): Board | null {
    return this.attachBoardId ? this.boardService.getBoard(this.attachBoardId) : null;
  }

  get attachBoardLists(): BoardList[] {
    return this.attachBoard?.lists ?? [];
  }

  get membershipBoards(): Board[] {
    const card = this.selectedCard;
    if (!card) {
      return [];
    }
    return this.boardService.boards.filter((board) =>
      this.boardService.isCardOnBoard(card.id, board.id),
    );
  }

  get canAttachCard(): boolean {
    if (!this.selectedCard) {
      return false;
    }
    if (!this.attachBoardId || !this.attachListId) {
      return false;
    }
    if (this.boardService.isCardOnBoard(this.selectedCard.id, this.attachBoardId)) {
      return false;
    }
    return true;
  }

  get attachNotice(): string {
    const card = this.selectedCard;
    if (!card || !this.attachBoard) {
      return '';
    }
    if (this.attachStatus && !this.attachError) {
      return '';
    }
    if (this.attachBoard.lists.length === 0) {
      return 'This board has no lists yet.';
    }
    if (this.boardService.isCardOnBoard(card.id, this.attachBoard.id)) {
      return 'Card already on this board.';
    }
    return '';
  }

  handleAttachBoardChange(boardId: string): void {
    this.attachBoardId = boardId;
    const firstListId = this.attachBoard?.lists[0]?.id ?? '';
    this.attachListId = firstListId;
    this.attachStatus = '';
    this.attachError = false;
  }

  handleAttachListChange(listId: string): void {
    this.attachListId = listId;
    this.attachStatus = '';
    this.attachError = false;
  }

  attachCardToBoard(card: Card): void {
    const result = this.boardService.addCardToBoard(card.id, this.attachBoardId, this.attachListId);
    if (!result.success) {
      this.attachStatus = result.error ?? 'Unable to add card to board.';
      this.attachError = true;
      return;
    }
    const boardTitle = this.attachBoard?.title ?? 'Board';
    const listTitle =
      this.attachBoardLists.find((list) => list.id === this.attachListId)?.title ?? 'List';
    this.attachStatus = `Added to ${boardTitle} / ${listTitle}.`;
    this.attachError = false;
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

  handleDescriptionBlur(card: Card): void {
    this.flushDescriptionSave(card);
    this.descriptionEditing = false;
    if (this.descriptionInput?.nativeElement) {
      this.descriptionInput.nativeElement.style.height = '';
    }
  }

  startDescriptionEdit(): void {
    this.descriptionEditing = true;
    setTimeout(() => {
      const input = this.descriptionInput?.nativeElement;
      if (!input) {
        return;
      }
      input.focus();
      const viewHeight = this.descriptionView?.nativeElement.getBoundingClientRect().height;
      const minHeight = 200;
      const maxHeight = 360;
      if (viewHeight) {
        const height = Math.min(Math.max(viewHeight, minHeight), maxHeight);
        input.style.height = `${height}px`;
      } else {
        input.style.height = `${minHeight}px`;
      }
      input.scrollTop = 0;
    });
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
    this.descriptionEditing = false;
    this.attachBoardId = '';
    this.attachListId = '';
    this.attachStatus = '';
    this.attachError = false;
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

  isCurrentBoard(boardId: string): boolean {
    return this.boardService.board?.id === boardId;
  }

  navigateToBoard(boardId: string, card: Card): void {
    if (this.isCurrentBoard(boardId)) {
      return;
    }
    const board = this.boardService.getBoard(boardId);
    if (!board) {
      return;
    }
    const list = board.lists.find((item) => item.cardIds.includes(card.id));
    this.boardService.board = board;
    if (!list) {
      this.closePanel();
      return;
    }
    this.boardService.selectedCard = { listId: list.id, cardId: card.id };
    this.lastScrolledCardId = null;
    this.descriptionEditing = false;
    this.resetAttachState(card);
  }

  renderMarkdown(text: string): string {
    return this.markdown.render(text);
  }

  private resetAttachState(card: Card): void {
    const boards = this.boardService.boards;
    if (!boards.length) {
      this.attachBoardId = '';
      this.attachListId = '';
      this.attachStatus = '';
      this.attachError = false;
      return;
    }
    const candidate =
      boards.find((board) => !this.boardService.isCardOnBoard(card.id, board.id)) ?? boards[0];
    this.attachBoardId = candidate.id;
    this.attachListId = candidate.lists[0]?.id ?? '';
    this.attachStatus = '';
    this.attachError = false;
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
