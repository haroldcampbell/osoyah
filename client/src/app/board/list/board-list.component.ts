import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardList, Card } from '../../models/board.model';
import { BoardCardComponent } from '../card/board-card.component';
import { BoardService } from '../../services/board.service';

@Component({
    selector: 'app-board-list',
    imports: [CommonModule, FormsModule, DragDropModule, BoardCardComponent],
    templateUrl: './board-list.component.html',
    styleUrl: './board-list.component.scss',
    host: {
        class: 'list',
    }
})
export class BoardListComponent implements AfterViewChecked {
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('listMenu') listMenu?: ElementRef<HTMLDetailsElement>;
  private needsFocus = false;

  get isEditingList(): boolean {
    return this.boardService.isEditingList(this.list);
  }

  get newCardTitle(): string {
    return this.boardService.newCardTitles[this.list.id] ?? '';
  }

  set newCardTitle(value: string) {
    this.boardService.newCardTitles[this.list.id] = value;
  }

  startTitleEdit(event?: Event): void {
    event?.stopPropagation();
    this.boardService.startListEdit(this.list);
    this.needsFocus = true;
  }

  saveTitleEdit(): void {
    this.boardService.saveListEdit(this.list);
  }

  cancelTitleEdit(): void {
    this.boardService.cancelListEdit();
  }

  requestRemoveList(): void {
    if (!window.confirm(`Remove "${this.list.title}" from this board?`)) {
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

  ngAfterViewChecked(): void {
    if (!this.isEditingList || !this.needsFocus) {
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

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.listMenu?.nativeElement.open) {
      this.listMenu.nativeElement.open = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.listMenu?.nativeElement.open) {
      return;
    }
    const target = event.target as Node | null;
    if (target && this.listMenu.nativeElement.contains(target)) {
      return;
    }
    this.listMenu.nativeElement.open = false;
  }
}
