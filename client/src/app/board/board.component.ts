import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkMenuModule } from '@angular/cdk/menu';
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
    imports: [CommonModule, FormsModule, DragDropModule, CdkMenuModule, BoardListComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, AfterViewChecked {
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  @ViewChild('descriptionInput') descriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('descriptionView') descriptionView?: ElementRef<HTMLElement>;
  @ViewChild('boardMenuPanel') boardMenuPanel?: ElementRef<HTMLElement>;
  commentFocused = false;
  descriptionEditing = false;
  attachBoardId = '';
  attachListId = '';
  attachStatus = '';
  attachError = false;
  boardMenuOpen = false;
  boardSearchTerm = '';
  newBoardTitle = '';
  createBoardError = '';
  boardSettingsOpen = false;
  boardSettingsTitle = '';
  boardSettingsError = '';
  boardPanelOpen = false;
  boardPanelSortMode: 'manual' | 'name' | 'name-desc' | 'recent' = 'manual';
  boardPanelArchivedView = false;
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
    if (this.boardPanelOpen) {
      this.boardPanelOpen = false;
      this.boardPanelArchivedView = false;
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

  get pinnedBoards(): Board[] {
    return this.boardService.pinnedOrder
      .map((id) => this.boardService.getBoard(id))
      .filter((board): board is Board => !!board && !board.archived);
  }

  get visibleBoards(): Board[] {
    return this.boardService.boardOrder
      .map((id) => this.boardService.getBoard(id))
      .filter((board): board is Board => !!board && !board.archived && !board.pinned);
  }

  get archivedBoards(): Board[] {
    return this.boardService.archivedOrder
      .map((id) => this.boardService.getBoard(id))
      .filter((board): board is Board => !!board && board.archived === true);
  }

  get filteredBoards(): Board[] {
    const term = this.boardSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.boardService.boards;
    }
    return this.boardService.boards.filter((board) => board.title.toLowerCase().includes(term));
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
    this.boardService.recordBoardActivity(boardId);
    if (!list) {
      this.closePanel();
      return;
    }
    this.boardService.selectedCard = { listId: list.id, cardId: card.id };
    this.lastScrolledCardId = null;
    this.descriptionEditing = false;
    this.resetAttachState(card);
  }

  toggleBoardPanel(): void {
    this.boardPanelOpen = !this.boardPanelOpen;
    if (this.boardPanelOpen) {
      this.boardMenuOpen = false;
      this.boardSettingsOpen = false;
      this.boardPanelArchivedView = false;
      this.boardService.closeCardPanel();
    }
  }

  closeBoardPanel(): void {
    this.boardPanelOpen = false;
    this.boardPanelArchivedView = false;
  }

  toggleArchivedView(): void {
    this.boardPanelArchivedView = !this.boardPanelArchivedView;
  }

  setBoardSortMode(mode: 'manual' | 'name' | 'name-desc' | 'recent'): void {
    this.boardPanelSortMode = mode;
    if (mode === 'manual') {
      return;
    }
    const sorted = (boards: Board[]): Board[] =>
      [...boards].sort((left, right) => {
        if (mode === 'name' || mode === 'name-desc') {
          return left.title.localeCompare(right.title);
        }
        const leftStamp = this.boardService.lastActiveAt[left.id] ?? 0;
        const rightStamp = this.boardService.lastActiveAt[right.id] ?? 0;
        if (rightStamp !== leftStamp) {
          return rightStamp - leftStamp;
        }
        return left.title.localeCompare(right.title);
      });
    const orderedVisible = sorted(this.visibleBoards);
    const orderedPinned = sorted(this.pinnedBoards);
    if (mode === 'name-desc') {
      orderedVisible.reverse();
      orderedPinned.reverse();
    }
    this.boardService.setBoardOrder(orderedVisible.map((board) => board.id));
    this.boardService.setPinnedOrder(orderedPinned.map((board) => board.id));
  }

  private applyCurrentBoardSort(): void {
    if (this.boardPanelSortMode !== 'manual') {
      this.setBoardSortMode(this.boardPanelSortMode);
    }
  }

  selectBoardFromPanel(board: Board): void {
    this.boardService.setActiveBoard(board.id);
    this.boardSettingsTitle = board.title;
  }

  handleBoardDrop(event: CdkDragDrop<Board[]>): void {
    const order = [...this.visibleBoards.map((board) => board.id)];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.boardService.setBoardOrder(order);
    this.boardPanelSortMode = 'manual';
  }

  handlePinnedDrop(event: CdkDragDrop<Board[]>): void {
    const order = [...this.pinnedBoards.map((board) => board.id)];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.boardService.setPinnedOrder(order);
    this.boardPanelSortMode = 'manual';
  }

  pinBoard(board: Board): void {
    this.boardService.pinBoard(board.id);
    this.applyCurrentBoardSort();
  }

  unpinBoard(board: Board): void {
    this.boardService.unpinBoard(board.id);
    this.applyCurrentBoardSort();
  }

  archiveBoard(board: Board): void {
    this.boardService.archiveBoard(board.id);
    this.applyCurrentBoardSort();
  }

  restoreBoard(board: Board): void {
    this.boardService.restoreBoard(board.id);
    this.applyCurrentBoardSort();
  }

  selectBoard(board: Board): void {
    if (this.boardService.board?.id === board.id) {
      return;
    }
    this.boardMenuOpen = false;
    this.boardSettingsOpen = false;
    this.boardSettingsError = '';
    this.closePanel();
    this.boardService.setActiveBoard(board.id);
    this.boardSettingsTitle = board.title;
    this.resetBoardMenuState();
  }

  createBoard(): void {
    const result = this.boardService.createBoard(this.newBoardTitle);
    if (!result.success) {
      this.createBoardError = result.error ?? 'Unable to create board.';
      return;
    }
    this.boardMenuOpen = false;
    this.newBoardTitle = '';
    this.createBoardError = '';
    this.boardSearchTerm = '';
    if (this.boardPanelSortMode !== 'manual') {
      this.setBoardSortMode(this.boardPanelSortMode);
    }
  }

  confirmDeleteCurrentBoard(): void {
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    if (!window.confirm(`Delete "${board.title}"?`)) {
      return;
    }
    const result = this.boardService.deleteBoard(board.id);
    if (!result.success) {
      this.boardSettingsError = result.error ?? 'Unable to delete board.';
      return;
    }
    this.boardMenuOpen = false;
    this.boardSettingsOpen = false;
    this.boardSettingsError = '';
    this.closePanel();
    this.boardSearchTerm = '';
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

  private resetBoardMenuState(): void {
    this.boardSearchTerm = '';
    this.newBoardTitle = '';
    this.createBoardError = '';
  }

  toggleBoardSettings(): void {
    this.boardSettingsOpen = !this.boardSettingsOpen;
    if (this.boardSettingsOpen) {
      this.boardSettingsTitle = this.boardService.board?.title ?? '';
    } else {
      this.boardSettingsError = '';
    }
  }

  saveBoardSettings(): void {
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    const result = this.boardService.renameBoard(board.id, this.boardSettingsTitle);
    if (!result.success) {
      this.boardSettingsError = result.error ?? 'Unable to rename board.';
      return;
    }
    this.boardSettingsError = '';
  }

  toggleBoardMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.boardMenuOpen = !this.boardMenuOpen;
    if (!this.boardMenuOpen) {
      this.resetBoardMenuState();
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
    if (this.boardMenuOpen) {
      this.boardMenuOpen = false;
      this.resetBoardMenuState();
    }
    if (this.boardSettingsOpen) {
      this.boardSettingsOpen = false;
      this.boardSettingsError = '';
    }
    if (this.boardPanelOpen) {
      this.boardPanelOpen = false;
      this.boardPanelArchivedView = false;
    }
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement?.classList.contains('board-selector')) {
      activeElement.blur();
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.boardMenuOpen) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (this.boardMenuPanel?.nativeElement.contains(target)) {
      return;
    }
    if (target.closest('.board-selector')) {
      return;
    }
    this.boardMenuOpen = false;
    this.resetBoardMenuState();
  }
}
