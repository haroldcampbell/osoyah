import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  HostListener,
  Input,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardList, Card } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { MarkdownService } from '../../services/markdown.service';

@Component({
    selector: 'app-board-card',
    imports: [CommonModule, FormsModule],
    templateUrl: './board-card.component.html',
    styleUrl: './board-card.component.scss',
    host: {
        class: 'card',
    }
})
export class BoardCardComponent implements AfterViewChecked {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  private needsFocus = false;

  get isEditing(): boolean {
    return this.boardService.isEditingCard(this.list, this.card);
  }

  startTitleEdit(event?: Event): void {
    event?.stopPropagation();
    this.boardService.closeCardPanel();
    this.boardService.startCardEdit(this.list, this.card);
    this.needsFocus = true;
  }

  saveTitleEdit(): void {
    this.boardService.saveCardEdit(this.list, this.card);
  }

  cancelTitleEdit(): void {
    this.boardService.cancelCardEdit();
  }

  openDetails(): void {
    if (this.isEditing || this.boardService.editingCard) {
      return;
    }
    this.boardService.openCardPanel(this.list, this.card);
  }

  @HostListener('click')
  handleCardClick(): void {
    this.openDetails();
  }

  ngAfterViewChecked(): void {
    if (!this.isEditing || !this.needsFocus) {
      return;
    }
    const input = this.titleInput?.nativeElement;
    if (!input) {
      return;
    }
    this.needsFocus = false;
    setTimeout(() => {
      input.focus();
      input.select();
    });
  }

  renderDescriptionPreview(description: string): string {
    return this.markdown.render(description);
  }
}
