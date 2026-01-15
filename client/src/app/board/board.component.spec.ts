import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { BoardComponent } from './board.component';
import { BoardService } from '../services/board.service';
import { Board, BoardList, BoardSummary, Card } from '../models/board.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

const makeCard = (id: string, title: string, description: string): Card => ({
  id,
  title,
  description,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  comments: [],
  status: { state: 'incomplete', completedAt: null },
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
      isProcessDone: false,
    },
    {
      id: 'list-2',
      title: 'Doing',
      cardIds: ['card-3'],
      isProcessDone: false,
    },
  ],
};

const mockBoardSummary: BoardSummary = {
  id: 'board-1',
  title: 'Test Board',
  createdAt: '2025-01-01T09:00:00Z',
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
      isProcessDone: false,
    },
  ],
};

const mockBoardTwoSummary: BoardSummary = {
  id: 'board-2',
  title: 'Second Board',
  createdAt: '2025-01-02T09:00:00Z',
};

const cloneBoard = (board: Board): Board => ({
  ...board,
  lists: board.lists.map((list) => ({
    ...list,
    cardIds: [...list.cardIds],
  })),
});

const cloneCards = (cards: Card[]): Card[] =>
  cards.map((card) => ({
    ...card,
    comments: [...card.comments],
    status: { ...card.status },
  }));

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
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('renders board lists and cards from data', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
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
    const createList = httpMock.expectOne('/api/boards/board-1/lists');
    createList.flush({
      ...mockBoard,
      lists: boardService.board?.lists ?? [],
    });

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
    const createdCardId = list.cardIds.at(-1);
    if (!createdCardId) {
      throw new Error('Missing new card id.');
    }
    const createdCard = component.boardService.getCard(createdCardId);
    if (!createdCard) {
      throw new Error('Missing new card data.');
    }
    const createCard = httpMock.expectOne('/api/cards');
    createCard.flush({
      ...createdCard,
      comments: [],
    });
    const attachCard = httpMock.expectOne(`/api/lists/${list.id}/cards`);
    attachCard.flush({ success: true });

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
    const reorder = httpMock.expectOne('/api/boards/board-1/list-order');
    reorder.flush({ success: true });

    expect(component.boardService.board?.lists[0].title).toBe('Doing');
  });

  it('moves cards between lists via drag and drop', () => {
    const component = initBoard();

    const sourceList = component.boardService.board?.lists[0];
    const targetList = component.boardService.board?.lists[1];
    if (!sourceList || !targetList) {
      throw new Error('Missing lists');
    }
    const movedCardId = sourceList.cardIds[0];

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { data: sourceList.cardIds, id: sourceList.id },
      container: { data: targetList.cardIds, id: targetList.id },
    } as CdkDragDrop<string[]>;

    component.boardService.dropCard(event);
    const removeCard = httpMock.match(`/api/lists/${sourceList.id}/cards/${movedCardId}`);
    expect(removeCard.length).toBe(1);
    removeCard[0].flush({ success: true });
    const attachCard = httpMock.match(`/api/lists/${targetList.id}/cards`);
    expect(attachCard.length).toBe(1);
    attachCard[0].flush({ success: true });
    const reorderSource = httpMock.match(`/api/lists/${sourceList.id}/card-order`);
    expect(reorderSource.length).toBe(1);
    reorderSource[0].flush({ success: true });
    const reorderTarget = httpMock.match(`/api/lists/${targetList.id}/card-order`);
    expect(reorderTarget.length).toBe(1);
    reorderTarget[0].flush({ success: true });

    expect(sourceList.cardIds.includes(movedCardId)).toBe(false);
    expect(targetList.cardIds.includes(movedCardId)).toBe(true);
  });

  it('loads board from route params', fakeAsync(() => {
    paramMapSubject.next(convertToParamMap({ boardId: 'board-1' }));
    const fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary, mockBoardTwoSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
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
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
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
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
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
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
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
    const summariesRequest = httpMock.expectOne('/api/boards');
    summariesRequest.flush({ boards: [mockBoardSummary, mockBoardTwoSummary] });
    const snapshotRequest = httpMock.expectOne('/api/boards/board-1/snapshot');
    snapshotRequest.flush({
      board: cloneBoard(mockBoard),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
    tick();
    fixture.detectChanges();

    paramMapSubject.next(convertToParamMap({ boardId: 'board-2', cardId: 'card-3' }));
    tick();
    fixture.detectChanges();
    const boardTwoSnapshot = httpMock.expectOne('/api/boards/board-2/snapshot');
    boardTwoSnapshot.flush({
      board: cloneBoard(mockBoardTwo),
      cards: cloneCards(mockCards),
      cardRelationships: [],
      boardRelationships: [],
    });
    tick();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.boardService.board?.id).toBe('board-2');
    expect(component.selectedCard?.id).toBe('card-3');
  }));
});
