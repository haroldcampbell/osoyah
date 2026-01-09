import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { BoardList } from '../../../models/board.model';
import { BoardListComponent } from '../../list/board-list.component';

@Component({
  selector: 'app-board-cards-view',
  standalone: true,
  imports: [CommonModule, DragDropModule, BoardListComponent],
  templateUrl: './board-cards-view.component.html',
  styleUrl: './board-cards-view.component.scss',
})
export class BoardCardsViewComponent implements AfterViewInit {
  @Input({ required: true }) lists: BoardList[] = [];
  @Output() listDropped = new EventEmitter<CdkDragDrop<BoardList[]>>();
  @Output() listsElementReady = new EventEmitter<HTMLElement | null>();
  @ViewChild('boardLists') boardListsRef?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.listsElementReady.emit(this.boardListsRef?.nativeElement ?? null);
  }
}
