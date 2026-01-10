import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

import { BoardService, BoardViewMode } from '../services/board.service';
import { BoardHeaderComponent } from '../board-header/board-header.component';
import { Board, BoardList, BoardRelationship, Card } from '../models/board.model';
import { CardPanelComponent } from './card-panel/card-panel.component';
import { BoardHierarchyMetricsComponent } from './board-hierarchy-metrics/board-hierarchy-metrics.component';
import { BoardCardsViewComponent } from './board-view/board-cards-view/board-cards-view.component';
import { BoardListViewComponent } from './board-view/board-list-view/board-list-view.component';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    CardPanelComponent,
    RouterLink,
    BoardHeaderComponent,
    BoardHierarchyMetricsComponent,
    BoardCardsViewComponent,
    BoardListViewComponent,
    BoardToolbarComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit, AfterViewChecked, AfterViewInit {
  readonly boardService = inject(BoardService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild(BoardToolbarComponent) boardToolbar?: BoardToolbarComponent;
  @ViewChild(CardPanelComponent) cardPanel?: CardPanelComponent;
  boardSettingsToastMessage = '';
  boardSettingsToastError = false;
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
  activeBoardId = '';
  activeCardId = '';
  hierarchyPanelOpen = false;
  hierarchyEditMode = false;
  hierarchyParentMenuOpen = false;
  hierarchyParentError = '';
  readonly hierarchyMaxDepth = 7;
  hierarchyNodes: HierarchyNode[] = [];
  isNarrowViewport = window.matchMedia('(max-width: 800px)').matches;
  readonly expandedListRows = new Set<string>();
  boardListsElement: HTMLElement | null = null;
  private lastSelectionId: string | null = null;
  private boardSettingsToastTimeoutId?: number;

  ngOnInit(): void {
    this.boardService.loadBoard({ recordActivity: false });
    combineLatest([this.boardService.boardLoaded$, this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([loaded, params]) => {
        if (!loaded || this.boardService.error) {
          return;
        }
        this.refreshHierarchy();
        window.setTimeout(() => {
          this.handleRoute(params.get('boardId'), params.get('cardId'));
        }, 0);
      });
  }

  ngAfterViewChecked(): void {
    if (!this.selectedCard) {
      this.lastSelectionId = null;
      return;
    }
    if (this.lastSelectionId === this.selectedCard.id) {
      return;
    }
    const activeCardId = this.selectedCard.id;
    window.setTimeout(() => {
      if (!this.selectedCard || this.selectedCard.id !== activeCardId) {
        return;
      }
      if (this.boardPanelOpen) {
        this.boardPanelOpen = false;
        this.boardPanelArchivedView = false;
      }
      this.lastSelectionId = activeCardId;
    }, 0);
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
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

  get viewMode(): BoardViewMode {
    return this.boardService.getBoardViewMode(this.boardService.board?.id);
  }

  get isListView(): boolean {
    return this.viewMode === 'list';
  }

  get listViewRows(): { card: Card; list: BoardList }[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const rows: { card: Card; list: BoardList }[] = [];
    board.lists.forEach((list) => {
      list.cardIds.forEach((cardId) => {
        const card = this.boardService.getCardFromList(list, cardId);
        if (!card) {
          return;
        }
        rows.push({ card, list });
      });
    });
    return rows;
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

  closePanel(navigate = true): void {
    if (this.cardPanel) {
      this.cardPanel.closePanel(navigate);
    } else {
      this.boardService.closeCardPanel();
      if (navigate) {
        this.navigateToBoardRoute(this.boardService.board?.id ?? '');
      }
    }
    this.cardNotFound = false;
    this.missingCardId = '';
  }

  isCurrentBoard(boardId: string): boolean {
    if (this.activeBoardId) {
      return this.activeBoardId === boardId;
    }
    return this.boardService.board?.id === boardId;
  }

  toggleBoardPanel(): void {
    this.boardPanelOpen = !this.boardPanelOpen;
    if (this.boardPanelOpen) {
      this.boardToolbar?.closeMenus();
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

  navigateToBoardRoute(boardId: string): void {
    if (!boardId) {
      return;
    }
    if (this.activeBoardId === boardId && !this.activeCardId) {
      return;
    }
    this.router.navigate(['/boards', boardId]);
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
      this.expandedListRows.clear();
      this.boardService.setActiveBoard(board.id);
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

  setViewMode(mode: BoardViewMode): void {
    const boardId = this.boardService.board?.id;
    if (!boardId) {
      return;
    }
    if (this.viewMode === mode) {
      return;
    }
    this.boardService.setBoardViewMode(boardId, mode);
    this.boardListsElement = null;
  }

  toggleListRow(cardId: string): void {
    if (this.expandedListRows.has(cardId)) {
      this.expandedListRows.delete(cardId);
      return;
    }
    this.expandedListRows.add(cardId);
  }

  openCardFromListView(list: BoardList, card: Card): void {
    const boardId = this.boardService.board?.id;
    if (!boardId) {
      return;
    }
    this.router.navigate(['/boards', boardId, 'cards', card.id]);
  }

  setBoardListsElement(element: HTMLElement | null): void {
    this.boardListsElement = element;
  }

  createBoardFromNotFound(): void {
    this.openCreateBoardModal();
  }

  handleBoardCreated(): void {
    if (this.boardPanelSortMode !== 'manual') {
      this.setBoardSortMode(this.boardPanelSortMode);
    }
  }

  handleBoardSettingsToast(event: { message: string; isError?: boolean }): void {
    this.showBoardSettingsToast(event.message, event.isError ?? false);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.cardPanel?.handleEscape()) {
      return;
    }
    this.boardService.cancelListEdit();
    this.boardService.cancelCardEdit();
    if (this.boardService.selectedCard) {
      this.closePanel();
    }
    if (this.hierarchyParentMenuOpen) {
      this.hierarchyParentMenuOpen = false;
      return;
    }
    if (this.isNarrowViewport && this.hierarchyPanelOpen) {
      this.hierarchyPanelOpen = false;
      return;
    }
    if (this.boardPanelOpen) {
      this.boardPanelOpen = false;
      this.boardPanelArchivedView = false;
    }
  }

  private showBoardSettingsToast(message: string, isError = false): void {
    this.boardSettingsToastMessage = message;
    this.boardSettingsToastError = isError;
    if (this.boardSettingsToastTimeoutId) {
      window.clearTimeout(this.boardSettingsToastTimeoutId);
    }
    this.boardSettingsToastTimeoutId = window.setTimeout(() => {
      this.boardSettingsToastMessage = '';
      this.boardSettingsToastError = false;
      this.boardSettingsToastTimeoutId = undefined;
    }, 2500);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (this.hierarchyParentMenuOpen) {
      const clickedHierarchyMenu =
        !!target.closest('.board-hierarchy-parent-menu') ||
        !!target.closest('.board-hierarchy-parent-button');
      if (!clickedHierarchyMenu) {
        this.hierarchyParentMenuOpen = false;
      }
    }
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    const isNarrow = window.matchMedia('(max-width: 800px)').matches;
    if (isNarrow !== this.isNarrowViewport) {
      this.isNarrowViewport = isNarrow;
      if (isNarrow) {
        this.hierarchyPanelOpen = false;
      }
    }
  }

  toggleHierarchyPanel(): void {
    this.hierarchyPanelOpen = !this.hierarchyPanelOpen;
  }

  openHierarchyManager(): void {
    this.hierarchyEditMode = true;
    this.hierarchyParentMenuOpen = true;
    this.hierarchyParentError = '';
    if (this.isNarrowViewport) {
      this.hierarchyPanelOpen = true;
    }
  }

  toggleHierarchyEdit(): void {
    this.hierarchyEditMode = !this.hierarchyEditMode;
    if (!this.hierarchyEditMode) {
      this.hierarchyParentMenuOpen = false;
      this.hierarchyParentError = '';
    }
  }

  toggleHierarchyParentMenu(): void {
    this.hierarchyParentMenuOpen = !this.hierarchyParentMenuOpen;
    if (this.hierarchyParentMenuOpen) {
      this.hierarchyParentError = '';
    }
  }

  isHierarchyRoot(boardId: string): boolean {
    return !this.getHierarchyMaps().parentByChild.has(boardId);
  }

  get hierarchyParentLabel(): string {
    const board = this.boardService.board;
    if (!board) {
      return 'No parent';
    }
    const parent = this.boardService.getBoardParent(board.id);
    return parent ? parent.title : 'No parent (root)';
  }

  get hierarchyParentOptions(): HierarchyParentOption[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const options: HierarchyParentOption[] = [];
    const rootEligibility = this.boardService.getBoardParentEligibility(
      board.id,
      null,
      this.hierarchyMaxDepth,
    );
    options.push({
      id: null,
      label: 'No parent (root)',
      disabled: !rootEligibility.allowed,
      helper: this.getHierarchyParentHelper(rootEligibility.reason),
    });
    this.boardService.boards.forEach((candidate) => {
      const eligibility = this.boardService.getBoardParentEligibility(
        board.id,
        candidate.id,
        this.hierarchyMaxDepth,
      );
      options.push({
        id: candidate.id,
        label: candidate.title,
        disabled: !eligibility.allowed,
        helper: this.getHierarchyParentHelper(eligibility.reason),
      });
    });
    return options;
  }

  get hierarchyReorderItems(): HierarchyNode[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const node = this.findHierarchyNode(board.id, this.hierarchyNodes);
    return node?.children ?? [];
  }

  handleHierarchyReorderDrop(event: CdkDragDrop<HierarchyNode[]>): void {
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    if (!this.hierarchyEditMode) {
      return;
    }
    if (event.previousContainer !== event.container) {
      return;
    }
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const orderedChildIds = event.container.data.map((child) => child.board.id);
    const result = this.boardService.reorderBoardChildren(board.id, orderedChildIds);
    if (!result.success) {
      moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
      return;
    }
    this.refreshHierarchy();
  }

  setHierarchyParent(option: HierarchyParentOption): void {
    const board = this.boardService.board;
    if (!board || option.disabled) {
      return;
    }
    const result = this.boardService.setBoardParent(board.id, option.id, this.hierarchyMaxDepth);
    if (!result.success) {
      this.hierarchyParentError = result.error ?? 'Unable to update parent.';
      return;
    }
    this.hierarchyParentMenuOpen = false;
    this.hierarchyParentError = '';
    this.refreshHierarchy();
  }

  get hierarchyRoots(): HierarchyNode[] {
    return this.hierarchyNodes;
  }

  get breadcrumbBoards(): Board[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const { parentByChild, relatedIds } = this.getHierarchyMaps();
    if (!relatedIds.has(board.id)) {
      return [];
    }
    const path: Board[] = [];
    const visited = new Set<string>();
    let currentId: string | undefined = board.id;
    while (currentId) {
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);
      const currentBoard = this.boardService.getBoard(currentId);
      if (currentBoard) {
        path.unshift(currentBoard);
      }
      currentId = parentByChild.get(currentId);
    }
    return path;
  }

  get isHierarchyBoard(): boolean {
    const board = this.boardService.board;
    if (!board) {
      return false;
    }
    return this.getHierarchyMaps().relatedIds.has(board.id);
  }

  private buildHierarchyRoots(): HierarchyNode[] {
    const { childrenByParent, rootIds } = this.getHierarchyMaps();
    const roots: HierarchyNode[] = [];
    rootIds.forEach((rootId) => {
      const node = this.buildHierarchyNode(rootId, childrenByParent, new Set());
      if (node) {
        roots.push(node);
      }
    });
    if (roots.length > 0) {
      return roots;
    }
    return [];
  }

  private refreshHierarchy(): void {
    this.hierarchyNodes = this.buildHierarchyRoots();
  }

  private buildHierarchyNode(
    boardId: string,
    childrenByParent: Map<string, string[]>,
    visited: Set<string>,
  ): HierarchyNode | null {
    if (visited.has(boardId)) {
      return null;
    }
    visited.add(boardId);
    const board = this.boardService.getBoard(boardId);
    if (!board) {
      return null;
    }
    const childrenIds = childrenByParent.get(boardId) ?? [];
    const children = childrenIds
      .map((childId) => this.buildHierarchyNode(childId, childrenByParent, new Set(visited)))
      .filter((child): child is HierarchyNode => !!child);
    return { board, children };
  }

  private findHierarchyNode(boardId: string, nodes: HierarchyNode[]): HierarchyNode | null {
    for (const node of nodes) {
      if (node.board.id === boardId) {
        return node;
      }
      const found = this.findHierarchyNode(boardId, node.children);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private getHierarchyMaps(): {
    parentByChild: Map<string, string>;
    childrenByParent: Map<string, string[]>;
    relatedIds: Set<string>;
    rootIds: string[];
  } {
    const relationships = this.boardService.boardRelationships ?? [];
    const parentByChild = new Map<string, string>();
    const childrenByParent = new Map<string, string[]>();
    const relatedIds = new Set<string>();

    relationships.forEach((relationship) => {
      parentByChild.set(relationship.childBoardId, relationship.parentBoardId);
      relatedIds.add(relationship.childBoardId);
      relatedIds.add(relationship.parentBoardId);
      const children = childrenByParent.get(relationship.parentBoardId) ?? [];
      if (!children.includes(relationship.childBoardId)) {
        children.push(relationship.childBoardId);
        childrenByParent.set(relationship.parentBoardId, children);
      }
    });

    const rootIds: string[] = [];
    relationships.forEach((relationship: BoardRelationship) => {
      const parentId = relationship.parentBoardId;
      if (!parentByChild.has(parentId) && !rootIds.includes(parentId)) {
        rootIds.push(parentId);
      }
    });

    return { parentByChild, childrenByParent, relatedIds, rootIds };
  }

  private getHierarchyParentHelper(reason?: 'self' | 'cycle' | 'depth'): string | undefined {
    if (!reason) {
      return undefined;
    }
    if (reason === 'self') {
      return 'Cannot parent a board to itself.';
    }
    if (reason === 'cycle') {
      return 'Would create a cycle.';
    }
    return `Would exceed depth ${this.hierarchyMaxDepth}.`;
  }
}

interface HierarchyNode {
  board: Board;
  children: HierarchyNode[];
}

interface HierarchyParentOption {
  id: string | null;
  label: string;
  disabled: boolean;
  helper?: string;
}
