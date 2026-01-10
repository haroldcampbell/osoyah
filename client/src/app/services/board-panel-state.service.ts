import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Board } from '../models/board.model';
import { BoardService } from './board.service';

@Injectable({ providedIn: 'root' })
export class BoardPanelStateService {
  private readonly boardService = inject(BoardService);
  private readonly router = inject(Router);

  panelOpen = false;
  archivedView = false;
  sortMode: 'manual' | 'name' | 'name-desc' | 'recent' = 'manual';

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

  isCurrentBoard(boardId: string): boolean {
    return this.boardService.board?.id === boardId;
  }

  openPanel(): void {
    this.panelOpen = true;
    this.archivedView = false;
  }

  closePanel(): void {
    this.panelOpen = false;
    this.archivedView = false;
  }

  togglePanel(): void {
    if (this.panelOpen) {
      this.closePanel();
      return;
    }
    this.openPanel();
  }

  toggleArchivedView(): void {
    this.archivedView = !this.archivedView;
  }

  setSortMode(mode: 'manual' | 'name' | 'name-desc' | 'recent'): void {
    this.sortMode = mode;
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

  applyCurrentSort(): void {
    if (this.sortMode !== 'manual') {
      this.setSortMode(this.sortMode);
    }
  }

  handleBoardDrop(event: CdkDragDrop<Board[]>): void {
    const order = [...this.visibleBoards.map((board) => board.id)];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.boardService.setBoardOrder(order);
    this.sortMode = 'manual';
  }

  handlePinnedDrop(event: CdkDragDrop<Board[]>): void {
    const order = [...this.pinnedBoards.map((board) => board.id)];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.boardService.setPinnedOrder(order);
    this.sortMode = 'manual';
  }

  pinBoard(board: Board): void {
    this.boardService.pinBoard(board.id);
    this.applyCurrentSort();
  }

  unpinBoard(board: Board): void {
    this.boardService.unpinBoard(board.id);
    this.applyCurrentSort();
  }

  archiveBoard(board: Board): void {
    this.boardService.archiveBoard(board.id);
    this.applyCurrentSort();
  }

  restoreBoard(board: Board): void {
    this.boardService.restoreBoard(board.id);
    this.applyCurrentSort();
  }

  selectBoard(board: Board): void {
    if (!board.id) {
      return;
    }
    if (this.isCurrentBoard(board.id) && !this.boardService.selectedCard) {
      return;
    }
    this.router.navigate(['/boards', board.id]);
  }
}
