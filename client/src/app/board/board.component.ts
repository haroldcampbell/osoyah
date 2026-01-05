import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

import { BoardService } from '../services/board.service';
import { BoardHeaderComponent } from '../board-header/board-header.component';
import { BoardListComponent } from './list/board-list.component';
import { Board, BoardList, Card, CardComment } from '../models/board.model';
import { MarkdownService } from '../services/markdown.service';

@Component({
    selector: 'app-board',
    imports: [
      CommonModule,
      FormsModule,
      DragDropModule,
      CdkMenuModule,
      BoardListComponent,
      RouterLink,
      BoardHeaderComponent,
    ],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, AfterViewChecked {
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('descriptionInput') descriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('descriptionView') descriptionView?: ElementRef<HTMLElement>;
  @ViewChild('boardMenuPanel') boardMenuPanel?: ElementRef<HTMLElement>;
  @ViewChild('panelTitleInput') panelTitleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('boardSettingsTitleInput') boardSettingsTitleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('boardSettingsDescriptionInput') boardSettingsDescriptionInput?: ElementRef<HTMLInputElement>;
  @ViewChild('boardLists') boardLists?: ElementRef<HTMLElement>;
  @ViewChild('listPickerPanel') listPickerPanel?: ElementRef<HTMLElement>;
  commentFocused = false;
  descriptionEditing = false;
  attachBoardId = '';
  attachListId = '';
  attachStatus = '';
  attachError = false;
  parentCardId = '';
  parentCurrentId = '';
  parentStatus = '';
  parentError = false;
  childStatus = '';
  childError = false;
  unlinkChildDialogOpen = false;
  unlinkChildTarget: Card | null = null;
  boardMenuOpen = false;
  listPickerOpen = false;
  boardSearchTerm = '';
  newBoardTitle = '';
  createBoardError = '';
  boardSettingsOpen = false;
  boardSettingsTitle = '';
  boardSettingsDescription = '';
  boardSettingsError = '';
  boardPanelOpen = false;
  boardPanelSortMode: 'manual' | 'name' | 'name-desc' | 'recent' = 'manual';
  boardPanelArchivedView = false;
  boardNotFound = false;
  cardNotFound = false;
  missingBoardId = '';
  missingCardId = '';
  createBoardModalOpen = false;
  createBoardModalTitle = '';
  createBoardModalError = '';
  panelCardTitleError = '';
  panelTitleEditing = false;
  private ignoreDescriptionSave = false;
  private activeBoardId = '';
  private activeCardId = '';
  private descriptionSaveTimeout?: number;
  private lastScrolledCardId: string | null = null;

  get commentExpanded(): boolean {
    return this.commentFocused || this.boardService.panelCommentDraft.trim().length > 0;
  }

  toggleCardCompletion(card: Card): void {
    const nextState = this.boardService.isCardCompleted(card) ? 'incomplete' : 'completed';
    this.boardService.setCardStatus(card, nextState, { source: 'manual' });
    if (nextState !== 'completed') {
      return;
    }
    const board = this.boardService.board;
    const selectedList = this.selectedList;
    const doneList = board?.lists.find((list) => list.isProcessDone);
    if (!board || !selectedList || !doneList) {
      return;
    }
    if (selectedList.id === doneList.id) {
      return;
    }
    const result = this.boardService.moveCardToList(card.id, selectedList.id, doneList.id, {
      skipStatus: true,
    });
    if (result.success) {
      this.boardService.addSystemComment(card.id, `Card moved to ${doneList.title}.`);
    }
  }

  createSegments(total: number): number[] {
    return Array.from({ length: total }, (_, index) => index);
  }

  ngOnInit(): void {
    this.boardService.loadBoard({ recordActivity: false });
    combineLatest([this.boardService.boardLoaded$, this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([loaded, params]) => {
        if (!loaded || this.boardService.error) {
          return;
        }
        window.setTimeout(() => {
          this.handleRoute(params.get('boardId'), params.get('cardId'));
        }, 0);
      });
  }

  ngAfterViewChecked(): void {
    if (!this.selectedCard) {
      this.lastScrolledCardId = null;
      return;
    }
    if (this.lastScrolledCardId === this.selectedCard.id) {
      return;
    }
    const activeCard = this.selectedCard;
    this.panelCardTitleError = '';
    window.setTimeout(() => {
      if (!this.selectedCard) {
        return;
      }
      if (this.boardPanelOpen) {
        this.boardPanelOpen = false;
        this.boardPanelArchivedView = false;
      }
      this.descriptionEditing = false;
      this.resetAttachState(activeCard);
      this.resetParentState(activeCard);
      if (this.scrollSelectedCardIntoView(activeCard.id)) {
        this.lastScrolledCardId = activeCard.id;
      }
    }, 0);
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

  get parentOptions(): Card[] {
    const card = this.selectedCard;
    if (!card) {
      return [];
    }
    const options = this.boardService.getValidParentOptions(card.id);
    const currentParent = this.boardService.getParentCard(card.id);
    if (currentParent && !options.some((option) => option.id === currentParent.id)) {
      return [currentParent, ...options];
    }
    return options;
  }

  get childCards(): Card[] {
    const card = this.selectedCard;
    if (!card) {
      return [];
    }
    return this.boardService.getChildCards(card.id);
  }

  get canSaveParent(): boolean {
    if (!this.selectedCard) {
      return false;
    }
    if (this.parentCardId === this.parentCurrentId) {
      return false;
    }
    return this.parentCardId !== '' || this.parentCurrentId !== '';
  }

  get parentActionLabel(): string {
    if (this.parentCardId === '' && this.parentCurrentId !== '') {
      return 'Remove parent';
    }
    if (this.parentCurrentId === '') {
      return 'Link parent';
    }
    return 'Update parent';
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
    if (this.ignoreDescriptionSave) {
      this.ignoreDescriptionSave = false;
      this.descriptionEditing = false;
      if (this.descriptionInput?.nativeElement) {
        this.descriptionInput.nativeElement.style.height = '';
      }
      return;
    }
    this.flushDescriptionSave(card);
    this.descriptionEditing = false;
    if (this.descriptionInput?.nativeElement) {
      this.descriptionInput.nativeElement.style.height = '';
    }
  }

  startDescriptionEdit(): void {
    this.descriptionEditing = true;
    this.ignoreDescriptionSave = false;
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

  cancelDescriptionEdit(): void {
    if (!this.selectedCard) {
      return;
    }
    this.ignoreDescriptionSave = true;
    this.boardService.panelCardDescription = this.selectedCard.description;
    this.descriptionEditing = false;
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
      this.descriptionSaveTimeout = undefined;
    }
    if (this.descriptionInput?.nativeElement) {
      this.descriptionInput.nativeElement.style.height = '';
      this.descriptionInput.nativeElement.blur();
    }
  }


  saveCardTitle(card: Card): void {
    const result = this.boardService.saveCardPanelTitle(card);
    if (!result.success) {
      this.panelCardTitleError = result.error ?? 'Unable to save card title.';
      return;
    }
    this.panelCardTitleError = '';
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
    this.closePanel(false);
  }

  closePanel(navigate = true): void {
    const lastCardId = this.boardService.selectedCard?.cardId ?? '';
    this.boardService.closeCardPanel();
    this.commentFocused = false;
    this.descriptionEditing = false;
    this.attachBoardId = '';
    this.attachListId = '';
    this.attachStatus = '';
    this.attachError = false;
    this.parentCardId = '';
    this.parentCurrentId = '';
    this.parentStatus = '';
    this.parentError = false;
    this.childStatus = '';
    this.childError = false;
    this.unlinkChildDialogOpen = false;
    this.unlinkChildTarget = null;
    this.listPickerOpen = false;
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
      this.descriptionSaveTimeout = undefined;
    }
    this.cardNotFound = false;
    this.missingCardId = '';
    this.panelCardTitleError = '';
    this.panelTitleEditing = false;
    if (navigate) {
      this.navigateToBoardRoute(this.boardService.board?.id ?? '');
    }
    if (lastCardId) {
      window.requestAnimationFrame(() => {
        this.scrollSelectedCardIntoView(lastCardId);
        window.setTimeout(() => {
          this.scrollSelectedCardIntoView(lastCardId);
        }, 80);
      });
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
    if (this.activeBoardId) {
      return this.activeBoardId === boardId;
    }
    return this.boardService.board?.id === boardId;
  }

  navigateToBoard(boardId: string, card: Card): void {
    if (this.isCurrentBoard(boardId)) {
      return;
    }
    this.navigateToCardRoute(boardId, card.id);
  }

  toggleBoardPanel(): void {
    this.boardPanelOpen = !this.boardPanelOpen;
    if (this.boardPanelOpen) {
      this.boardMenuOpen = false;
      this.boardSettingsOpen = false;
      this.boardPanelArchivedView = false;
      this.closePanel();
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
    this.navigateToBoardRoute(board.id);
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
    if (this.activeBoardId === board.id && !this.activeCardId && !this.boardNotFound) {
      return;
    }
    this.boardMenuOpen = false;
    this.boardSettingsOpen = false;
    this.boardSettingsError = '';
    this.closePanel(false);
    this.navigateToBoardRoute(board.id);
    this.boardSettingsTitle = board.title;
    this.resetBoardMenuState();
  }

  createBoard(): void {
    const result = this.boardService.createBoard(this.newBoardTitle);
    if (!result.success) {
      this.createBoardError = result.error ?? 'Unable to create board.';
      return;
    }
    if (result.board) {
      this.navigateToBoardRoute(result.board.id);
    }
    this.boardMenuOpen = false;
    this.newBoardTitle = '';
    this.createBoardError = '';
    this.boardSearchTerm = '';
    if (this.boardPanelSortMode !== 'manual') {
      this.setBoardSortMode(this.boardPanelSortMode);
    }
  }

  openCreateBoardModal(): void {
    this.createBoardModalOpen = true;
    this.createBoardModalTitle = '';
    this.createBoardModalError = '';
  }

  closeCreateBoardModal(): void {
    this.createBoardModalOpen = false;
    this.createBoardModalTitle = '';
    this.createBoardModalError = '';
  }

  saveCreateBoardModal(): void {
    const result = this.boardService.createBoard(this.createBoardModalTitle);
    if (!result.success || !result.board) {
      this.createBoardModalError = result.error ?? 'Unable to create board.';
      return;
    }
    this.createBoardModalOpen = false;
    this.createBoardModalTitle = '';
    this.createBoardModalError = '';
    this.navigateToBoardRoute(result.board.id);
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
    if (this.boardService.board) {
      this.navigateToBoardRoute(this.boardService.board.id);
    }
  }

  renderMarkdown(text: string): string {
    return this.markdown.render(text);
  }

  formatCardLabel(card: Card): string {
    return `${card.id} - ${card.title}`;
  }

  handleParentSelectionChange(): void {
    this.parentStatus = '';
    this.parentError = false;
  }

  saveParentRelationship(card: Card): void {
    if (!this.canSaveParent) {
      return;
    }
    if (!this.parentCardId) {
      const result = this.boardService.unlinkParent(card.id);
      if (!result.success) {
        this.parentStatus = result.error ?? 'Unable to remove parent.';
        this.parentError = true;
        return;
      }
      this.parentCurrentId = '';
      this.parentStatus = 'Parent removed.';
      this.parentError = false;
      return;
    }
    const result = this.boardService.addCardRelationship(card.id, this.parentCardId);
    if (!result.success) {
      this.parentStatus = result.error ?? 'Unable to link parent.';
      this.parentError = true;
      return;
    }
    this.parentCurrentId = this.parentCardId;
    this.parentStatus = 'Parent updated.';
    this.parentError = false;
  }

  navigateToParent(card: Card): void {
    const parent = this.boardService.getParentCard(card.id);
    if (!parent) {
      return;
    }
    const board = this.boardService.getBoardForCard(parent.id);
    if (!board) {
      this.parentStatus = 'Parent card is not on an active board.';
      this.parentError = true;
      return;
    }
    this.navigateToCardRoute(board.id, parent.id);
  }

  navigateToChild(child: Card): void {
    const board = this.boardService.getBoardForCard(child.id);
    if (!board) {
      this.childStatus = 'Child card is not on an active board.';
      this.childError = true;
      return;
    }
    this.navigateToCardRoute(board.id, child.id);
  }

  openUnlinkChildDialog(child: Card): void {
    this.unlinkChildDialogOpen = true;
    this.unlinkChildTarget = child;
    this.childStatus = '';
    this.childError = false;
  }

  cancelUnlinkChild(): void {
    this.unlinkChildDialogOpen = false;
    this.unlinkChildTarget = null;
  }

  confirmUnlinkChild(parent: Card | null): void {
    if (!parent) {
      return;
    }
    const child = this.unlinkChildTarget;
    if (!child) {
      return;
    }
    const result = this.boardService.unlinkChild(parent.id, child.id);
    if (!result.success) {
      this.childStatus = result.error ?? 'Unable to unlink child.';
      this.childError = true;
      return;
    }
    const remaining = this.boardService.getChildCards(parent.id).length;
    this.childStatus = remaining > 0 ? 'Child unlinked.' : '';
    this.childError = false;
    this.unlinkChildDialogOpen = false;
    this.unlinkChildTarget = null;
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

  private resetParentState(card: Card): void {
    const relationship = this.boardService.getParentRelationship(card.id);
    this.parentCurrentId = relationship?.parentCardId ?? '';
    this.parentCardId = this.parentCurrentId;
    this.parentStatus = '';
    this.parentError = false;
  }

  private resetBoardMenuState(): void {
    this.boardSearchTerm = '';
    this.newBoardTitle = '';
    this.createBoardError = '';
  }

  navigateToBoardRoute(boardId: string): void {
    if (!boardId) {
      return;
    }
    if (this.activeBoardId === boardId && !this.activeCardId) {
      return;
    }
    this.router.navigate(['/boards', boardId]);
  }

  private navigateToCardRoute(boardId: string, cardId: string): void {
    if (!boardId || !cardId) {
      return;
    }
    if (this.activeBoardId === boardId && this.activeCardId === cardId) {
      return;
    }
    this.router.navigate(['/boards', boardId, 'cards', cardId]);
  }

  private handleRoute(boardId: string | null, cardId: string | null): void {
    this.activeBoardId = boardId ?? '';
    this.activeCardId = cardId ?? '';
    this.boardNotFound = false;
    this.cardNotFound = false;
    this.missingBoardId = '';
    this.missingCardId = '';

    if (!boardId) {
      return;
    }

    const board = this.boardService.getBoard(boardId);
    if (!board) {
      this.boardNotFound = true;
      this.missingBoardId = boardId;
      this.boardService.closeCardPanel();
      return;
    }

    if (this.boardService.board?.id !== board.id) {
      this.boardService.setActiveBoard(board.id);
      this.boardSettingsTitle = board.title;
    } else {
      this.boardService.recordBoardActivity(board.id);
    }

    if (!cardId) {
      this.boardService.closeCardPanel();
      return;
    }

    const list = board.lists.find((item) => item.cardIds.includes(cardId));
    const card = list ? this.boardService.getCard(cardId) : null;
    if (!list || !card) {
      this.boardService.closeCardPanel();
      this.cardNotFound = true;
      this.missingCardId = cardId;
      return;
    }

    this.boardService.openCardPanel(list, card);
  }

  createBoardFromNotFound(): void {
    this.openCreateBoardModal();
  }

  toggleBoardSettings(): void {
    this.boardSettingsOpen = !this.boardSettingsOpen;
    if (this.boardSettingsOpen) {
      this.boardSettingsTitle = this.boardService.board?.title ?? '';
      this.boardSettingsDescription = this.boardService.board?.description ?? '';
    } else {
      this.boardSettingsError = '';
    }
  }

  closeBoardSettings(): void {
    this.boardSettingsOpen = false;
    this.boardSettingsTitle = this.boardService.board?.title ?? '';
    this.boardSettingsDescription = this.boardService.board?.description ?? '';
    this.boardSettingsError = '';
  }

  saveBoardSettings(): void {
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    const result = this.boardService.updateBoardSettings(
      board.id,
      this.boardSettingsTitle,
      this.boardSettingsDescription,
    );
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

  toggleListPicker(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.selectedList || !this.boardService.board?.lists.length) {
      return;
    }
    this.listPickerOpen = !this.listPickerOpen;
  }

  moveSelectedCardToList(list: BoardList): void {
    const card = this.selectedCard;
    const currentList = this.selectedList;
    if (!card || !currentList) {
      this.listPickerOpen = false;
      return;
    }
    if (list.id === currentList.id) {
      this.listPickerOpen = false;
      return;
    }
    this.boardService.moveCardToList(card.id, currentList.id, list.id);
    this.listPickerOpen = false;
    window.setTimeout(() => {
      this.scrollSelectedCardIntoView(card.id);
    }, 80);
    window.setTimeout(() => {
      this.scrollSelectedCardIntoView(card.id);
    }, 160);
  }

  private scrollSelectedCardIntoView(cardId: string): boolean {
    const lists = this.boardLists?.nativeElement;
    if (!lists) {
      return false;
    }
    const card = lists.querySelector(`[data-testid="card"][data-card-id="${cardId}"]`);
    if (!card) {
      return false;
    }
    window.requestAnimationFrame(() => {
      const listsRect = lists.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const panel = this.elementRef.nativeElement.querySelector('.card-panel');
      const panelRect = panel?.getBoundingClientRect();
      const buffer = 12;
      const visibleLeft = listsRect.left + buffer;
      const visibleRight =
        Math.min(listsRect.right, panelRect?.left ?? listsRect.right) - buffer;
      let nextScrollLeft = lists.scrollLeft;
      if (cardRect.left < visibleLeft) {
        nextScrollLeft -= visibleLeft - cardRect.left;
      } else if (cardRect.right > visibleRight) {
        nextScrollLeft += cardRect.right - visibleRight;
      }
      if (nextScrollLeft !== lists.scrollLeft) {
        lists.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
      }
    });
    return true;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.panelTitleEditing && this.selectedCard) {
      this.boardService.panelCardTitle = this.selectedCard.title;
      this.panelCardTitleError = '';
      this.panelTitleEditing = false;
      this.panelTitleInput?.nativeElement.blur();
      return;
    }
    if (this.descriptionEditing && this.selectedCard) {
      this.cancelDescriptionEdit();
      return;
    }
    if (this.listPickerOpen) {
      this.listPickerOpen = false;
      return;
    }
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
      this.closeBoardSettings();
      return;
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

  startPanelTitleEdit(): void {
    this.panelTitleEditing = true;
  }

  stopPanelTitleEdit(): void {
    this.panelTitleEditing = false;
  }

  cancelBoardSettingsTitleEdit(): void {
    this.boardSettingsTitle = this.boardService.board?.title ?? '';
    this.boardSettingsError = '';
    this.boardSettingsTitleInput?.nativeElement.blur();
  }

  cancelBoardSettingsDescriptionEdit(): void {
    this.boardSettingsDescription = this.boardService.board?.description ?? '';
    this.boardSettingsError = '';
    this.boardSettingsDescriptionInput?.nativeElement.blur();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (this.boardMenuOpen) {
      const clickedBoardMenu =
        this.boardMenuPanel?.nativeElement.contains(target) || !!target.closest('.board-selector');
      if (!clickedBoardMenu) {
        this.boardMenuOpen = false;
        this.resetBoardMenuState();
      }
    }
    if (this.listPickerOpen) {
      const clickedListPicker =
        this.listPickerPanel?.nativeElement.contains(target) ||
        !!target.closest('.card-panel-list-trigger');
      if (!clickedListPicker) {
        this.listPickerOpen = false;
      }
    }
  }
}
