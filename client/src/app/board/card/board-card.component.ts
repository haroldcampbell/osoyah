import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardList, Card } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-card.component.html',
  styleUrl: './board-card.component.scss',
  host: {
    class: 'card',
  },
})
export class BoardCardComponent {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);

  get isEditing(): boolean {
    return this.boardService.isEditingCard(this.list, this.card);
  }

  requestRemove(): void {
    if (!window.confirm(`Remove "${this.card.title}"?`)) {
      return;
    }

    this.boardService.removeCard(this.list, this.card);
  }
}
