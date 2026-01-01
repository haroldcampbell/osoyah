import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Board, BoardGallerySortMode } from '../models/board.model';
import { BoardHeaderComponent } from '../board-header/board-header.component';
import { BoardGalleryStateService } from '../services/board-gallery-state.service';
import { BoardService } from '../services/board.service';

type GallerySection = 'recent' | 'pinned' | 'all';

@Component({
  selector: 'app-board-gallery',
  imports: [CommonModule, FormsModule, BoardHeaderComponent],
  templateUrl: './board-gallery.component.html',
  styleUrl: './board-gallery.component.scss',
})
export class BoardGalleryComponent implements OnInit {
  readonly boardService = inject(BoardService);
  private readonly boardGalleryState = inject(BoardGalleryStateService);
  private readonly router = inject(Router);

  searchTerm = '';
  sortMode: BoardGallerySortMode = 'name-asc';
  newBoardTitle = '';
  createBoardError = '';
  createBoardOpen = false;

  readonly sortOptions: { value: BoardGallerySortMode; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'last-opened-desc', label: 'Last opened (newest)' },
    { value: 'last-opened-asc', label: 'Last opened (oldest)' },
    { value: 'created-desc', label: 'Created (newest)' },
    { value: 'created-asc', label: 'Created (oldest)' },
  ];

  ngOnInit(): void {
    this.boardService.loadBoard({ recordActivity: false });
    this.sortMode = this.boardGalleryState.getSortMode(this.sortMode);
  }

  get recentBoards(): Board[] {
    const boards = this.filterBoards(this.visibleBoards).filter(
      (board) => this.getLastOpened(board) > 0,
    );
    return boards.sort((a, b) => this.getLastOpened(b) - this.getLastOpened(a));
  }

  get pinnedBoards(): Board[] {
    return this.filterBoards(this.visibleBoards).filter((board) => board.pinned);
  }

  get allBoards(): Board[] {
    const boards = this.filterBoards(this.visibleBoards);
    return this.sortBoards(boards, this.sortMode);
  }

  getEmptyMessage(section: GallerySection): string {
    if (this.searchTerm.trim()) {
      return 'No boards match your search.';
    }
    if (section === 'recent') {
      return 'No recent boards yet.';
    }
    if (section === 'pinned') {
      return 'No pinned boards yet.';
    }
    return 'No boards yet.';
  }

  updateSortMode(): void {
    this.boardGalleryState.setSortMode(this.sortMode);
  }

  formatDescription(description?: string): string {
    if (!description) {
      return '';
    }
    const trimmed = description.trim();
    if (trimmed.length <= 30) {
      return trimmed;
    }
    return `${trimmed.slice(0, 27)}...`;
  }

  toggleCreateBoard(): void {
    this.createBoardOpen = !this.createBoardOpen;
    if (!this.createBoardOpen) {
      this.newBoardTitle = '';
      this.createBoardError = '';
    }
  }

  createBoard(): void {
    const result = this.boardService.createBoard(this.newBoardTitle);
    if (!result.success || !result.board) {
      this.createBoardError = result.error ?? 'Unable to create board.';
      return;
    }
    this.createBoardOpen = false;
    this.newBoardTitle = '';
    this.createBoardError = '';
    this.router.navigate(['/boards', result.board.id]);
  }

  openBoard(board: Board): void {
    this.router.navigate(['/boards', board.id]);
  }

  togglePin(board: Board, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (board.pinned) {
      this.boardService.unpinBoard(board.id);
    } else {
      this.boardService.pinBoard(board.id);
    }
  }

  private get visibleBoards(): Board[] {
    return this.boardService.boards.filter((board) => !board.archived);
  }

  private filterBoards(boards: Board[]): Board[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return boards;
    }
    return boards.filter((board) => board.title.toLowerCase().includes(term));
  }

  private sortBoards(boards: Board[], mode: BoardGallerySortMode): Board[] {
    const sorted = [...boards];
    switch (mode) {
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }));
        break;
      case 'last-opened-desc':
        sorted.sort((a, b) => this.getLastOpened(b) - this.getLastOpened(a));
        break;
      case 'last-opened-asc':
        sorted.sort((a, b) => this.getLastOpened(a) - this.getLastOpened(b));
        break;
      case 'created-desc':
        sorted.sort((a, b) => this.getCreatedAt(b) - this.getCreatedAt(a));
        break;
      case 'created-asc':
        sorted.sort((a, b) => this.getCreatedAt(a) - this.getCreatedAt(b));
        break;
    }
    return sorted;
  }

  private getLastOpened(board: Board): number {
    return this.boardService.lastActiveAt[board.id] ?? 0;
  }

  private getCreatedAt(board: Board): number {
    const timestamp = Date.parse(board.createdAt);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
