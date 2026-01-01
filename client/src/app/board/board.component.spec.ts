import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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

const mockCards = [
  makeCard('card-1', 'Card One', 'First'),
  makeCard('card-2', 'Card Two', 'Second'),
  makeCard('card-3', 'Card Three', 'Third'),
];

const mockBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  createdAt: '2025-01-01T09:00:00Z',
  lists: [
    {
      id: 'list-1',
      title: 'Backlog',
      cardIds: ['card-1', 'card-2'],
    },
    {
      id: 'list-2',
      title: 'Doing',
      cardIds: ['card-3'],
    },
  ],
};

const mockBoardTwo: Board = {
  id: 'board-2',
  title: 'Second Board',
  createdAt: '2025-01-02T09:00:00Z',
  lists: [
    {
      id: 'list-3',
      title: 'Todo',
      cardIds: ['card-3'],
    },
  ],
};

describe('BoardComponent', () => {
  let httpMock: HttpTestingController;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let routerSpy: jasmine.Spy;

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [BoardComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    httpMock.verify();
  });

  const initBoard = (): BoardComponent => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard], cards: mockCards });
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('renders board lists and cards from data', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard], cards: mockCards });
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

    const newCardId = list.cardIds.find(
      (cardId) => component.boardService.getCard(cardId)?.title === 'New card',
    );
    expect(newCardId).toBeDefined();
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
      previousContainer: { data: sourceList.cardIds },
      container: { data: targetList.cardIds },
    } as CdkDragDrop<string[]>;

    component.boardService.dropCard(event);

    expect(sourceList.cardIds.includes('card-1')).toBe(false);
    expect(targetList.cardIds.includes('card-1')).toBe(true);
  });

  it('loads board from route params', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-1' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard, mockBoardTwo], cards: mockCards });
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.boardNotFound).toBe(false);
    expect(component.boardService.board?.id).toBe('board-1');
  }));

  it('opens card panel from route params', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-1', cardId: 'card-2' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard], cards: mockCards });
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.cardNotFound).toBe(false);
    expect(component.selectedCard?.id).toBe('card-2');
  }));

  it('shows board not found state for invalid board IDs', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-404' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard], cards: mockCards });
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.boardNotFound).toBe(true);
    expect(component.missingBoardId).toBe('board-404');
    expect(routerSpy).not.toHaveBeenCalledWith(['/boards', 'board-1']);
  }));

  it('shows card not found state for invalid card IDs', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-1', cardId: 'card-404' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard], cards: mockCards });
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.cardNotFound).toBe(true);
    expect(component.missingCardId).toBe('card-404');
    expect(component.selectedCard).toBeNull();
  }));

  it('updates board and card when route params change', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-1' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const request = httpMock.expectOne('assets/data.json');
    request.flush({ boards: [mockBoard, mockBoardTwo], cards: mockCards });
    tick();
    fixture.detectChanges();

    paramMapSubject.next(convertToParamMap({ boardId: 'board-2', cardId: 'card-3' }));
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.boardService.board?.id).toBe('board-2');
    expect(component.selectedCard?.id).toBe('card-3');
  }));
});
