import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BoardList, Card } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { MarkdownService } from '../../services/markdown.service';

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
export class BoardCardComponent implements AfterViewChecked, OnInit {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);
  private readonly markdown = inject(MarkdownService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  private needsFocus = false;
  titleError = '';

  ngOnInit(): void {
    this.boardService.inlineError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.scope === 'card-title' && event.cardId === this.card.id) {
          this.titleError = event.message;
        }
      });
  }

  get isEditing(): boolean {
    return this.boardService.isEditingCard(this.list, this.card);
  }

  startTitleEdit(event?: Event): void {
    event?.stopPropagation();
    this.boardService.closeCardPanel();
    this.boardService.startCardEdit(this.list, this.card);
    this.needsFocus = true;
    this.titleError = '';
  }

  saveTitleEdit(): void {
    const result = this.boardService.saveCardEdit(this.list, this.card);
    if (!result.success) {
      this.titleError = result.error ?? 'Unable to save card title.';
      this.needsFocus = true;
      return;
    }
    this.titleError = '';
  }

  cancelTitleEdit(): void {
    this.boardService.cancelCardEdit();
    this.titleError = '';
  }

  handleTitleInput(): void {
    this.titleError = '';
  }

  openDetails(): void {
    if (this.isEditing || this.boardService.editingCard) {
      return;
    }
    const boardId = this.boardService.board?.id;
    if (!boardId) {
      return;
    }
    this.router.navigate(['/boards', boardId, 'cards', this.card.id]);
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

  createSegments(total: number): number[] {
    return Array.from({ length: total }, (_, index) => index);
  }
}
