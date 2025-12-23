import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardList, Card } from '../../models/board.model';
import { BoardCardComponent } from '../card/board-card.component';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, BoardCardComponent],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.scss',
  host: {
    class: 'list',
  },
})
export class BoardListComponent {
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);

  get isEditingList(): boolean {
    return this.boardService.isEditingList(this.list);
  }

  get newCardTitle(): string {
    return this.boardService.newCardTitles[this.list.id] ?? '';
  }

  set newCardTitle(value: string) {
    this.boardService.newCardTitles[this.list.id] = value;
  }

  requestRemoveList(): void {
    if (!window.confirm(`Remove "${this.list.title}" and all cards?`)) {
      return;
    }

    this.boardService.removeList(this.list);
  }

  requestAddCard(): void {
    this.boardService.addCard(this.list);
  }

  requestStartCardEdit(card: Card): void {
    this.boardService.startCardEdit(this.list, card);
  }

  requestSaveCardEdit(card: Card): void {
    this.boardService.saveCardEdit(this.list, card);
  }

  requestRemoveCard(card: Card): void {
    this.boardService.removeCard(this.list, card);
  }
}
