import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Board } from '../../models/board.model';
import { BoardPanelStateService } from '../../services/board-panel-state.service';

@Component({
  selector: 'app-board-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './board-panel.component.html',
  styleUrl: './board-panel.component.scss',
})
export class BoardPanelComponent {
  readonly panelState = inject(BoardPanelStateService);

  isCurrentBoard(boardId: string): boolean {
    return this.panelState.isCurrentBoard(boardId);
  }

  handleSortModeChange(mode: 'manual' | 'name' | 'name-desc' | 'recent'): void {
    this.panelState.setSortMode(mode);
  }

  selectBoard(board: Board): void {
    this.panelState.selectBoard(board);
  }

  handlePinnedDrop(event: CdkDragDrop<Board[]>): void {
    this.panelState.handlePinnedDrop(event);
  }

  handleBoardDrop(event: CdkDragDrop<Board[]>): void {
    this.panelState.handleBoardDrop(event);
  }

  pinBoard(board: Board): void {
    this.panelState.pinBoard(board);
  }

  unpinBoard(board: Board): void {
    this.panelState.unpinBoard(board);
  }

  archiveBoard(board: Board): void {
    this.panelState.archiveBoard(board);
  }

  restoreBoard(board: Board): void {
    this.panelState.restoreBoard(board);
  }
}
