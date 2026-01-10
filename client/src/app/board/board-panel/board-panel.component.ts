import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Board } from '../../models/board.model';

@Component({
  selector: 'app-board-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './board-panel.component.html',
  styleUrl: './board-panel.component.scss',
})
export class BoardPanelComponent {
  @Input() activeBoardId = '';
  @Input() currentBoardId = '';
  @Input() archivedView = false;
  @Input() sortMode: 'manual' | 'name' | 'name-desc' | 'recent' = 'manual';
  @Input() archivedBoards: Board[] = [];
  @Input() pinnedBoards: Board[] = [];
  @Input() visibleBoards: Board[] = [];

  @Output() archivedViewToggle = new EventEmitter<void>();
  @Output() closePanel = new EventEmitter<void>();
  @Output() sortModeChange = new EventEmitter<'manual' | 'name' | 'name-desc' | 'recent'>();
  @Output() pinnedDrop = new EventEmitter<CdkDragDrop<Board[]>>();
  @Output() boardDrop = new EventEmitter<CdkDragDrop<Board[]>>();
  @Output() selectBoard = new EventEmitter<Board>();
  @Output() pinBoard = new EventEmitter<Board>();
  @Output() unpinBoard = new EventEmitter<Board>();
  @Output() archiveBoard = new EventEmitter<Board>();
  @Output() restoreBoard = new EventEmitter<Board>();

  isCurrentBoard(boardId: string): boolean {
    if (this.activeBoardId) {
      return this.activeBoardId === boardId;
    }
    return this.currentBoardId === boardId;
  }

  handleSortModeChange(mode: 'manual' | 'name' | 'name-desc' | 'recent'): void {
    this.sortModeChange.emit(mode);
  }
}
