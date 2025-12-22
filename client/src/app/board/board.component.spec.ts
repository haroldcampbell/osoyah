import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { BoardComponent } from './board.component';
import { BoardService } from '../services/board.service';
import { Board, BoardList, Card } from '../models/board.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

const mockBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  lists: [
    {
      id: 'list-1',
      title: 'Backlog',
      cards: [
        { id: 'card-1', title: 'Card One', description: 'First' },
        { id: 'card-2', title: 'Card Two', description: 'Second' },
      ],
    },
    {
      id: 'list-2',
      title: 'Doing',
      cards: [{ id: 'card-3', title: 'Card Three', description: 'Third' }],
    },
  ],
};

describe('BoardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        {
          provide: BoardService,
          useValue: {
            getBoards: () => of([mockBoard]),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders board lists and cards from data', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();

    const listTitles = fixture.debugElement.queryAll(By.css('[data-testid="list-title"]'));
    expect(listTitles.length).toBe(2);
    expect(listTitles[0].nativeElement.textContent).toContain('Backlog');

    const cards = fixture.debugElement.queryAll(By.css('[data-testid="card"]'));
    expect(cards.length).toBe(3);
  });

  it('adds a list when a title is provided', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.newListTitle = 'Review';
    component.addList();

    expect(component.board?.lists.some((list) => list.title === 'Review')).toBe(true);
  });

  it('adds a card to a list when a title is provided', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const list = component.board?.lists[0];
    if (!list) {
      throw new Error('Missing list');
    }

    component.newCardTitles[list.id] = 'New card';
    component.addCard(list);

    expect(list.cards.some((card) => card.title === 'New card')).toBe(true);
  });

  it('reorders lists via drag and drop', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      container: { data: component.board?.lists ?? [] },
      previousContainer: { data: component.board?.lists ?? [] },
    } as CdkDragDrop<BoardList[]>;

    component.dropList(event);

    expect(component.board?.lists[0].title).toBe('Doing');
  });

  it('moves cards between lists via drag and drop', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const sourceList = component.board?.lists[0];
    const targetList = component.board?.lists[1];
    if (!sourceList || !targetList) {
      throw new Error('Missing lists');
    }

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { data: sourceList.cards },
      container: { data: targetList.cards },
    } as CdkDragDrop<Card[]>;

    component.dropCard(event);

    expect(sourceList.cards.some((card) => card.id === 'card-1')).toBe(false);
    expect(targetList.cards.some((card) => card.id === 'card-1')).toBe(true);
  });
});
