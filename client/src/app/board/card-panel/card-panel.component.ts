import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Board, BoardList, Card, CardComment } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { MarkdownService } from '../../services/markdown.service';

@Component({
  selector: 'app-card-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkMenuModule],
  templateUrl: './card-panel.component.html',
  styleUrl: './card-panel.component.scss',
})
export class CardPanelComponent implements OnChanges, OnInit {
  @Input({ required: true }) selectedCard!: Card;
  @Input({ required: true }) selectedList!: BoardList;
  @Input() boardLists?: HTMLElement | null;
  @Input() activeBoardId = '';
  @Input() activeCardId = '';
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('descriptionInput') descriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('descriptionView') descriptionView?: ElementRef<HTMLElement>;
  @ViewChild('panelTitleInput') panelTitleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('listPickerPanel') listPickerPanel?: ElementRef<HTMLElement>;
  @ViewChild('parentPickerPanel') parentPickerPanel?: ElementRef<HTMLElement>;
  @ViewChild('parentSearchInput') parentSearchInput?: ElementRef<HTMLInputElement>;
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
  listPickerOpen = false;
  parentMenuOpen = false;
  parentSearchInputValue = '';
  parentSearchTerm = '';
  panelCardTitleError = '';
  panelTitleEditing = false;
  private ignoreDescriptionSave = false;
  private descriptionSaveTimeout?: number;
  private parentSearchTimeout?: number;
  private lastScrolledCardId: string | null = null;

  ngOnInit(): void {
    this.boardService.inlineError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.scope === 'card-panel-title' && event.cardId === this.selectedCard?.id) {
          this.panelCardTitleError = event.message;
        }
        if (event.scope === 'card-attach' && event.cardId === this.selectedCard?.id) {
          this.attachStatus = event.message;
          this.attachError = true;
        }
        if (event.scope === 'card-parent' && event.cardId === this.selectedCard?.id) {
          this.parentStatus = event.message;
          this.parentError = true;
        }
        if (event.scope === 'card-child' && event.cardId) {
          this.childStatus = event.message;
          this.childError = true;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedCard']) {
      return;
    }
    const nextCard = changes['selectedCard'].currentValue as Card | null;
    if (!nextCard) {
      this.lastScrolledCardId = null;
      return;
    }
    if (this.lastScrolledCardId === nextCard.id) {
      return;
    }
    this.panelCardTitleError = '';
    window.setTimeout(() => {
      if (!this.selectedCard || this.selectedCard.id !== nextCard.id) {
        return;
      }
      this.descriptionEditing = false;
      this.resetAttachState(nextCard);
      this.resetParentState(nextCard);
      if (this.scrollSelectedCardIntoView(nextCard.id)) {
        this.lastScrolledCardId = nextCard.id;
      }
    }, 0);
  }

  get commentExpanded(): boolean {
    return this.commentFocused || this.boardService.panelCommentDraft.trim().length > 0;
  }

  get attachBoard(): Board | null {
    return this.attachBoardId ? this.boardService.getBoard(this.attachBoardId) : null;
  }

  get attachBoardLists(): BoardList[] {
    return this.attachBoard?.lists ?? [];
  }

  get membershipBoards(): Board[] {
    return this.boardService.boards.filter((board) =>
      this.boardService.isCardOnBoard(this.selectedCard.id, board.id),
    );
  }

  get parentOptions(): Card[] {
    const options = this.boardService.getValidParentOptions(this.selectedCard.id);
    const currentParent = this.boardService.getParentCard(this.selectedCard.id);
    if (currentParent && !options.some((option) => option.id === currentParent.id)) {
      return [currentParent, ...options];
    }
    return options;
  }

  get parentSelectionLabel(): string {
    if (!this.parentCardId) {
      return 'No parent';
    }
    const parent = this.boardService.getCard(this.parentCardId);
    return parent ? this.formatCardLabel(parent) : 'No parent';
  }

  get parentSelectedCard(): Card | null {
    if (!this.parentCardId) {
      return null;
    }
    return this.boardService.getCard(this.parentCardId) ?? null;
  }

  get parentPinnedCard(): Card | null {
    const term = this.parentSearchTerm.trim().toLowerCase();
    if (!term) {
      return null;
    }
    const selected = this.parentSelectedCard;
    if (!selected) {
      return null;
    }
    return this.parentMatchesTerm(selected, term) ? null : selected;
  }

  get parentFilteredOptions(): Card[] {
    const term = this.parentSearchTerm.trim().toLowerCase();
    const options = this.parentOptions;
    if (!term) {
      return options;
    }
    return options.filter((card) => this.parentMatchesTerm(card, term));
  }

  get childCards(): Card[] {
    return this.boardService.getChildCards(this.selectedCard.id);
  }

  get canSaveParent(): boolean {
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

  get canAttachCard(): boolean {
    if (!this.attachBoardId || !this.attachListId) {
      return false;
    }
    if (this.boardService.isCardOnBoard(this.selectedCard.id, this.attachBoardId)) {
      return false;
    }
    return true;
  }

  get attachNotice(): string {
    if (!this.attachBoard) {
      return '';
    }
    if (this.attachStatus && !this.attachError) {
      return '';
    }
    if (this.attachBoard.lists.length === 0) {
      return 'This board has no lists yet.';
    }
    if (this.boardService.isCardOnBoard(this.selectedCard.id, this.attachBoard.id)) {
      return 'Card already on this board.';
    }
    return '';
  }

  toggleCardCompletion(card: Card): void {
    const nextState = this.boardService.isCardCompleted(card) ? 'incomplete' : 'completed';
    this.boardService.setCardStatus(card, nextState, { source: 'manual' });
    if (nextState !== 'completed') {
      return;
    }
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    const doneLists = this.boardService.getDoneLists(board.id);
    if (!doneLists.length) {
      return;
    }
    if (doneLists.some((list) => list.id === this.selectedList.id)) {
      return;
    }
    const targetList = doneLists[0];
    this.boardService.moveCardToList(card.id, this.selectedList.id, targetList.id, {
      skipStatus: true,
    });
  }

  createSegments(total: number): number[] {
    return Array.from({ length: total }, (_, index) => index);
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
    if (!window.confirm(`Remove "${card.title}"?`)) {
      return;
    }
    this.boardService.removeCard(this.selectedList, card);
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
    this.parentMenuOpen = false;
    this.parentSearchInputValue = '';
    this.parentSearchTerm = '';
    if (this.parentSearchTimeout) {
      window.clearTimeout(this.parentSearchTimeout);
      this.parentSearchTimeout = undefined;
    }
    this.panelCardTitleError = '';
    this.panelTitleEditing = false;
    if (this.descriptionSaveTimeout) {
      window.clearTimeout(this.descriptionSaveTimeout);
      this.descriptionSaveTimeout = undefined;
    }
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
    this.scrollListIntoView(list.id);
    this.scheduleScrollToCard(card.id);
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

  toggleParentMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.parentMenuOpen = !this.parentMenuOpen;
    if (this.parentMenuOpen) {
      this.parentSearchInputValue = '';
      this.parentSearchTerm = '';
      if (this.parentSearchTimeout) {
        window.clearTimeout(this.parentSearchTimeout);
        this.parentSearchTimeout = undefined;
      }
      setTimeout(() => {
        this.parentSearchInput?.nativeElement.focus();
      }, 0);
    } else {
      this.parentSearchInputValue = '';
      this.parentSearchTerm = '';
      if (this.parentSearchTimeout) {
        window.clearTimeout(this.parentSearchTimeout);
        this.parentSearchTimeout = undefined;
      }
    }
  }

  handleParentSearchChange(nextValue: string): void {
    this.parentSearchInputValue = nextValue;
    if (this.parentSearchTimeout) {
      window.clearTimeout(this.parentSearchTimeout);
    }
    this.parentSearchTimeout = window.setTimeout(() => {
      this.parentSearchTerm = nextValue;
    }, 150);
  }

  selectParentCard(cardId: string): void {
    this.parentCardId = cardId;
    this.handleParentSelectionChange();
    this.parentMenuOpen = false;
    this.parentSearchInputValue = '';
    this.parentSearchTerm = '';
    if (this.parentSearchTimeout) {
      window.clearTimeout(this.parentSearchTimeout);
      this.parentSearchTimeout = undefined;
    }
  }

  startPanelTitleEdit(): void {
    this.panelTitleEditing = true;
  }

  stopPanelTitleEdit(): void {
    this.panelTitleEditing = false;
  }

  handleEscape(): boolean {
    if (this.panelTitleEditing) {
      this.boardService.panelCardTitle = this.selectedCard.title;
      this.panelCardTitleError = '';
      this.panelTitleEditing = false;
      this.panelTitleInput?.nativeElement.blur();
      return true;
    }
    if (this.descriptionEditing) {
      this.cancelDescriptionEdit();
      return true;
    }
    if (this.listPickerOpen) {
      this.listPickerOpen = false;
      return true;
    }
    if (this.parentMenuOpen) {
      this.parentMenuOpen = false;
      this.parentSearchInputValue = '';
      this.parentSearchTerm = '';
      if (this.parentSearchTimeout) {
        window.clearTimeout(this.parentSearchTimeout);
        this.parentSearchTimeout = undefined;
      }
      return true;
    }
    return false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (this.listPickerOpen) {
      const clickedListPicker =
        this.listPickerPanel?.nativeElement.contains(target) ||
        !!target.closest('.card-panel-list-trigger');
      if (!clickedListPicker) {
        this.listPickerOpen = false;
      }
    }
    if (this.parentMenuOpen) {
      const clickedParentPicker =
        this.parentPickerPanel?.nativeElement.contains(target) ||
        !!target.closest('.card-panel-parent-trigger');
      if (!clickedParentPicker) {
        this.parentMenuOpen = false;
        this.parentSearchInputValue = '';
        this.parentSearchTerm = '';
        if (this.parentSearchTimeout) {
          window.clearTimeout(this.parentSearchTimeout);
          this.parentSearchTimeout = undefined;
        }
      }
    }
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
    this.parentSearchInputValue = '';
    this.parentSearchTerm = '';
    if (this.parentSearchTimeout) {
      window.clearTimeout(this.parentSearchTimeout);
      this.parentSearchTimeout = undefined;
    }
  }

  private navigateToBoardRoute(boardId: string): void {
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

  private scrollSelectedCardIntoView(cardId: string): boolean {
    const lists = this.boardLists ?? null;
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
      const visibleRight = Math.min(listsRect.right, panelRect?.left ?? listsRect.right) - buffer;
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

  private scrollListIntoView(listId: string): void {
    const lists = this.boardLists ?? null;
    if (!lists) {
      return;
    }
    const list = lists.querySelector(`[data-testid="list"][data-list-id="${listId}"]`);
    if (!list) {
      return;
    }
    list.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private scheduleScrollToCard(cardId: string): void {
    if (!cardId) {
      return;
    }
    let attempts = 0;
    const tryScroll = () => {
      attempts += 1;
      if (this.scrollSelectedCardIntoView(cardId)) {
        return;
      }
      if (attempts < 6) {
        window.setTimeout(tryScroll, 120);
      }
    };
    window.setTimeout(tryScroll, 60);
  }

  private parentMatchesTerm(card: Card, term: string): boolean {
    const normalizedTerm = term.toLowerCase();
    return (
      card.id.toLowerCase().includes(normalizedTerm) ||
      card.title.toLowerCase().includes(normalizedTerm)
    );
  }
}
