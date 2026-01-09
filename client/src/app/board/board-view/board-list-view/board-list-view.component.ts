import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';

import { BoardList, Card } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';

@Component({
  selector: 'app-board-list-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-list-view.component.html',
  styleUrl: './board-list-view.component.scss',
})
export class BoardListViewComponent implements AfterViewInit {
  @Input({ required: true }) listViewRows: { card: Card; list: BoardList }[] = [];
  @Input({ required: true }) expandedRowIds!: Set<string>;
  @Output() toggleRow = new EventEmitter<string>();
  @Output() openCard = new EventEmitter<{ list: BoardList; card: Card }>();
  @Output() listsElementReady = new EventEmitter<HTMLElement | null>();
  @ViewChild('boardLists') boardListsRef?: ElementRef<HTMLElement>;

  readonly boardService = inject(BoardService);

  ngAfterViewInit(): void {
    this.listsElementReady.emit(this.boardListsRef?.nativeElement ?? null);
  }

  handleToggleRow(cardId: string): void {
    this.toggleRow.emit(cardId);
  }

  handleOpenCard(list: BoardList, card: Card): void {
    this.openCard.emit({ list, card });
  }
}
