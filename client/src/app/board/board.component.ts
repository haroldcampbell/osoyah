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
import { BoardList, Card } from '../models/board.model';
import { CardPanelComponent } from './card-panel/card-panel.component';
import { BoardHierarchyMetricsComponent } from './board-hierarchy-metrics/board-hierarchy-metrics.component';
import { BoardHierarchyPanelComponent } from './board-hierarchy-panel/board-hierarchy-panel.component';
import { BoardHierarchyDrawerComponent } from './board-hierarchy-drawer/board-hierarchy-drawer.component';
import { BoardCardsViewComponent } from './board-view/board-cards-view/board-cards-view.component';
import { BoardListViewComponent } from './board-view/board-list-view/board-list-view.component';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';
import { BoardPanelComponent } from './board-panel/board-panel.component';
import { BoardPanelStateService } from '../services/board-panel-state.service';
import { HierarchyPanelStateService } from '../services/hierarchy-panel-state.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardPanelComponent,
    RouterLink,
    BoardHeaderComponent,
    BoardHierarchyMetricsComponent,
    BoardHierarchyPanelComponent,
    BoardHierarchyDrawerComponent,
    BoardCardsViewComponent,
    BoardListViewComponent,
    BoardToolbarComponent,
    BoardPanelComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit, AfterViewChecked, AfterViewInit {
  readonly boardService = inject(BoardService);
  readonly boardPanelState = inject(BoardPanelStateService);
  readonly hierarchyPanelState = inject(HierarchyPanelStateService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild(BoardToolbarComponent) boardToolbar?: BoardToolbarComponent;
  @ViewChild(CardPanelComponent) cardPanel?: CardPanelComponent;
  boardSettingsToastMessage = '';
  boardSettingsToastError = false;
  boardNotFound = false;
  cardNotFound = false;
  missingBoardId = '';
  missingCardId = '';
  createBoardModalOpen = false;
  createBoardModalTitle = '';
  createBoardModalError = '';
  activeBoardId = '';
  activeCardId = '';
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
        this.hierarchyPanelState.refreshHierarchy();
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
      if (this.boardPanelState.panelOpen) {
        this.boardPanelState.closePanel();
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
    if (this.boardPanelState.panelOpen) {
      this.boardPanelState.closePanel();
      return;
    }
    this.boardToolbar?.closeMenus();
    this.closePanel();
    this.boardPanelState.openPanel();
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
    this.boardPanelState.applyCurrentSort();
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
    if (this.hierarchyPanelState.parentMenuOpen) {
      this.hierarchyPanelState.closeParentMenu();
      return;
    }
    if (this.hierarchyPanelState.isNarrowViewport && this.hierarchyPanelState.panelOpen) {
      this.hierarchyPanelState.closePanel();
      return;
    }
    if (this.boardPanelState.panelOpen) {
      this.boardPanelState.closePanel();
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
    if (this.hierarchyPanelState.parentMenuOpen) {
      const clickedHierarchyMenu =
        !!target.closest('.board-hierarchy-parent-menu') ||
        !!target.closest('.board-hierarchy-parent-button');
      if (!clickedHierarchyMenu) {
        this.hierarchyPanelState.closeParentMenu();
      }
    }
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    const isNarrow = window.matchMedia('(max-width: 800px)').matches;
    this.hierarchyPanelState.updateViewport(isNarrow);
  }
}
