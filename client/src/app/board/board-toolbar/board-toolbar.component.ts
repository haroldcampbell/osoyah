import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Board, BoardList } from '../../models/board.model';
import { BoardService, BoardViewMode } from '../../services/board.service';

@Component({
  selector: 'app-board-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkMenuModule],
  templateUrl: './board-toolbar.component.html',
  styleUrl: './board-toolbar.component.scss',
})
export class BoardToolbarComponent {
  @Input() viewMode: BoardViewMode = 'cards';
  @Output() viewModeChange = new EventEmitter<BoardViewMode>();
  @Output() closePanelRequested = new EventEmitter<boolean>();
  @Output() boardCreated = new EventEmitter<void>();
  @Output() boardSettingsToast = new EventEmitter<{ message: string; isError?: boolean }>();

  @ViewChild('boardMenuPanel') boardMenuPanel?: ElementRef<HTMLElement>;
  @ViewChild('boardSettingsTitleInput') boardSettingsTitleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('boardSettingsDescriptionInput')
  boardSettingsDescriptionInput?: ElementRef<HTMLInputElement>;

  readonly boardService = inject(BoardService);
  private readonly router = inject(Router);

  boardMenuOpen = false;
  boardSearchTerm = '';
  newBoardTitle = '';
  createBoardError = '';
  boardSettingsOpen = false;
  boardSettingsTitle = '';
  boardSettingsDescription = '';
  boardSettingsRollupsEnabled = false;
  boardSettingsError = '';

  get filteredBoards(): Board[] {
    const term = this.boardSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.boardService.boards;
    }
    return this.boardService.boards.filter((board) => board.title.toLowerCase().includes(term));
  }

  isCurrentBoard(boardId: string): boolean {
    return this.boardService.board?.id === boardId;
  }

  get boardTitle(): string {
    return this.boardService.board?.title ?? '';
  }

  get boardLists(): BoardList[] {
    return this.boardService.board?.lists ?? [];
  }

  get boardCreatedAt(): string | undefined {
    return this.boardService.board?.createdAt;
  }

  toggleBoardMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.boardMenuOpen = !this.boardMenuOpen;
    if (!this.boardMenuOpen) {
      this.resetBoardMenuState();
    }
  }

  selectBoard(board: Board): void {
    const currentBoardId = this.boardService.board?.id ?? '';
    const hasActiveCard = !!this.boardService.selectedCard;
    if (currentBoardId === board.id && !hasActiveCard) {
      return;
    }
    this.boardMenuOpen = false;
    this.boardSettingsOpen = false;
    this.boardSettingsError = '';
    this.closePanelRequested.emit(false);
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
    this.boardCreated.emit();
  }

  toggleBoardSettings(): void {
    this.boardSettingsOpen = !this.boardSettingsOpen;
    if (this.boardSettingsOpen) {
      this.boardSettingsTitle = this.boardService.board?.title ?? '';
      this.boardSettingsDescription = this.boardService.board?.description ?? '';
      this.boardSettingsRollupsEnabled = this.boardService.board?.rollupsEnabled ?? false;
    } else {
      this.boardSettingsError = '';
    }
  }

  closeBoardSettings(): void {
    this.boardSettingsOpen = false;
    this.boardSettingsTitle = this.boardService.board?.title ?? '';
    this.boardSettingsDescription = this.boardService.board?.description ?? '';
    this.boardSettingsRollupsEnabled = this.boardService.board?.rollupsEnabled ?? false;
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
      this.boardSettingsRollupsEnabled,
    );
    if (!result.success) {
      this.boardSettingsError = result.error ?? 'Unable to rename board.';
      this.boardSettingsToast.emit({ message: this.boardSettingsError, isError: true });
      return;
    }
    this.boardSettingsError = '';
    this.boardSettingsToast.emit({ message: 'Board settings saved.' });
    this.closeBoardSettings();
  }

  toggleDoneList(list: BoardList, event: Event): void {
    const boardId = this.boardService.board?.id;
    if (!boardId) {
      return;
    }
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    const result = this.boardService.setListProcessDone(boardId, list.id, target.checked);
    if (!result.success) {
      this.boardSettingsError = result.error ?? 'Unable to update done list.';
      return;
    }
    this.boardSettingsError = '';
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
    this.closePanelRequested.emit(true);
    this.boardSearchTerm = '';
    if (this.boardService.board) {
      this.navigateToBoardRoute(this.boardService.board.id);
    }
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

  requestViewMode(mode: BoardViewMode): void {
    this.viewModeChange.emit(mode);
  }

  closeMenus(): void {
    this.boardMenuOpen = false;
    this.boardSettingsOpen = false;
  }

  private resetBoardMenuState(): void {
    this.boardSearchTerm = '';
    this.newBoardTitle = '';
    this.createBoardError = '';
  }

  private navigateToBoardRoute(boardId: string): void {
    if (!boardId) {
      return;
    }
    const currentBoardId = this.boardService.board?.id ?? '';
    const hasActiveCard = !!this.boardService.selectedCard;
    if (currentBoardId === boardId && !hasActiveCard) {
      return;
    }
    this.router.navigate(['/boards', boardId]);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.boardMenuOpen) {
      this.boardMenuOpen = false;
      this.resetBoardMenuState();
    }
    if (this.boardSettingsOpen) {
      this.closeBoardSettings();
      return;
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
    const clickedBoardMenu =
      this.boardMenuPanel?.nativeElement.contains(target) || !!target.closest('.board-selector');
    if (!clickedBoardMenu) {
      this.boardMenuOpen = false;
      this.resetBoardMenuState();
    }
  }
}
