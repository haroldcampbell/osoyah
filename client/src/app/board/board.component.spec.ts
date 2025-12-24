import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BoardComponent } from './board.component';
import { BoardService } from '../services/board.service';
import { Board, BoardList, Card } from '../models/board.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

const makeCard = (id: string, title: string, description: string): Card => ({
  id,
  title,
  description,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  comments: [],
});

const mockBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  lists: [
    {
      id: 'list-1',
      title: 'Backlog',
      cards: [
        makeCard('card-1', 'Card One', 'First'),
        makeCard('card-2', 'Card Two', 'Second'),
      ],
    },
    {
      id: 'list-2',
      title: 'Doing',
      cards: [makeCard('card-3', 'Card Three', 'Third')],
    },
  ],
};

describe('BoardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent, HttpClientTestingModule],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const initBoard = (): BoardComponent => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard] });
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('renders board lists and cards from data', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard] });
    fixture.detectChanges();

    const listTitles = fixture.debugElement.queryAll(By.css('[data-testid="list-title"]'));
    expect(listTitles.length).toBe(2);
    expect(listTitles[0].nativeElement.textContent).toContain('Backlog');

    const cards = fixture.debugElement.queryAll(By.css('[data-testid="card"]'));
    expect(cards.length).toBe(3);
  });

  it('adds a list when a title is provided', () => {
    initBoard();
    const boardService = TestBed.inject(BoardService);
    boardService.newListTitle = 'Review';
    boardService.addList();

    expect(boardService.board?.lists.some((list) => list.title === 'Review')).toBe(true);
  });

  it('adds a card to a list when a title is provided', () => {
    const component = initBoard();

    const list = component.boardService.board?.lists[0];
    if (!list) {
      throw new Error('Missing list');
    }

    component.boardService.newCardTitles[list.id] = 'New card';
    component.boardService.addCard(list);

    expect(list.cards.some((card) => card.title === 'New card')).toBe(true);
  });

  it('reorders lists via drag and drop', () => {
    const component = initBoard();

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      container: { data: component.boardService.board?.lists ?? [] },
      previousContainer: { data: component.boardService.board?.lists ?? [] },
    } as CdkDragDrop<BoardList[]>;

    component.boardService.dropList(event);

    expect(component.boardService.board?.lists[0].title).toBe('Doing');
  });

  it('moves cards between lists via drag and drop', () => {
    const component = initBoard();

    const sourceList = component.boardService.board?.lists[0];
    const targetList = component.boardService.board?.lists[1];
    if (!sourceList || !targetList) {
      throw new Error('Missing lists');
    }

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { data: sourceList.cards },
      container: { data: targetList.cards },
    } as CdkDragDrop<Card[]>;

    component.boardService.dropCard(event);

    expect(sourceList.cards.some((card) => card.id === 'card-1')).toBe(false);
    expect(targetList.cards.some((card) => card.id === 'card-1')).toBe(true);
  });
});
