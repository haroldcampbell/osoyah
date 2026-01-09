import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { BoardService } from './board.service';
import { Board, BoardList, Card } from '../models/board.model';

describe('BoardService relationships', () => {
  let service: BoardService;
  let board: Board;
  let list: BoardList;
  let cardParent: Card;
  let cardChild: Card;
  let cardOther: Card;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(BoardService);

    cardParent = {
      id: 'card-1',
      title: 'Parent',
      description: '',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      comments: [],
      status: { state: 'incomplete', completedAt: null },
    };
    cardChild = {
      id: 'card-2',
      title: 'Child',
      description: '',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      comments: [],
      status: { state: 'incomplete', completedAt: null },
    };
    cardOther = {
      id: 'card-3',
      title: 'Other',
      description: '',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      comments: [],
      status: { state: 'incomplete', completedAt: null },
    };

    list = {
      id: 'list-1',
      title: 'Backlog',
      cardIds: [cardParent.id, cardChild.id, cardOther.id],
      isProcessDone: false,
    };
    board = {
      id: 'board-1',
      title: 'Board',
      createdAt: '2025-01-01T00:00:00Z',
      lists: [list],
    };

    service.boards = [board];
    service.board = board;
    service.cardsById = {
      [cardParent.id]: cardParent,
      [cardChild.id]: cardChild,
      [cardOther.id]: cardOther,
    };
    service.cardRelationships = [];
  });

  it('prevents cycles when selecting a parent', () => {
    expect(service.addCardRelationship(cardChild.id, cardParent.id).success).toBe(true);
    expect(service.addCardRelationship(cardOther.id, cardChild.id).success).toBe(true);

    const attempt = service.addCardRelationship(cardParent.id, cardOther.id);
    expect(attempt.success).toBe(false);
    expect(
      service.getValidParentOptions(cardParent.id).some((card) => card.id === cardOther.id),
    ).toBe(false);
  });

  it('records system comments when linking relationships', () => {
    const result = service.addCardRelationship(cardChild.id, cardParent.id);
    expect(result.success).toBe(true);

    const childComment = cardChild.comments.at(-1);
    expect(childComment?.authorType).toBe('system');
    expect(childComment?.message).toBe(
      `Parent card linked: [**${cardParent.id} - ${cardParent.title}**](/boards/${board.id}/cards/${cardParent.id})`,
    );

    const parentComment = cardParent.comments.at(-1);
    expect(parentComment?.authorType).toBe('system');
    expect(parentComment?.message).toBe(
      `Child card linked: [**${cardChild.id} - ${cardChild.title}**](/boards/${board.id}/cards/${cardChild.id})`,
    );
  });

  it('records system comments when unlinking relationships', () => {
    service.addCardRelationship(cardChild.id, cardParent.id);
    const result = service.unlinkParent(cardChild.id);
    expect(result.success).toBe(true);

    const childComment = cardChild.comments.at(-1);
    expect(childComment?.authorType).toBe('system');
    expect(childComment?.message).toBe(
      `Parent card unlinked: [**${cardParent.id} - ${cardParent.title}**](/boards/${board.id}/cards/${cardParent.id})`,
    );

    const parentComment = cardParent.comments.at(-1);
    expect(parentComment?.authorType).toBe('system');
    expect(parentComment?.message).toBe(
      `Child card unlinked: [**${cardChild.id} - ${cardChild.title}**](/boards/${board.id}/cards/${cardChild.id})`,
    );
  });

  it('unlinks children and records comments when a parent is removed', () => {
    service.addCardRelationship(cardChild.id, cardParent.id);
    service.removeCard(list, cardParent);

    expect(service.cardRelationships).toHaveSize(0);
    const childComment = cardChild.comments.at(-1);
    expect(childComment?.authorType).toBe('system');
    expect(childComment?.message).toBe(
      `Parent card unlinked: **${cardParent.id} - ${cardParent.title}**`,
    );
  });
});

describe('BoardService list move comments', () => {
  let service: BoardService;
  let card: Card;
  let boardOne: Board;
  let boardTwo: Board;
  let listOneSource: BoardList;
  let listOneTarget: BoardList;
  let listTwoSource: BoardList;
  let listTwoTarget: BoardList;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(BoardService);

    card = {
      id: 'card-1',
      title: 'Shared card',
      description: '',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      comments: [],
      status: { state: 'incomplete', completedAt: null },
    };

    listOneSource = {
      id: 'list-1',
      title: 'Backlog',
      cardIds: [card.id],
      isProcessDone: false,
    };
    listOneTarget = {
      id: 'list-2',
      title: 'Done',
      cardIds: [],
      isProcessDone: true,
    };
    listTwoSource = {
      id: 'list-3',
      title: 'Leads',
      cardIds: [card.id],
      isProcessDone: false,
    };
    listTwoTarget = {
      id: 'list-4',
      title: 'Closed',
      cardIds: [],
      isProcessDone: true,
    };

    boardOne = {
      id: 'board-1',
      title: 'Product Roadmap',
      createdAt: '2025-01-01T00:00:00Z',
      lists: [listOneSource, listOneTarget],
    };
    boardTwo = {
      id: 'board-2',
      title: 'Sales Pipeline',
      createdAt: '2025-01-01T00:00:00Z',
      lists: [listTwoSource, listTwoTarget],
    };

    service.boards = [boardOne, boardTwo];
    service.board = boardTwo;
    service.cardsById = {
      [card.id]: card,
    };
  });

  it('records list move comments with the active board link (list picker)', () => {
    const result = service.moveCardToList(card.id, listTwoSource.id, listTwoTarget.id);

    expect(result.success).toBe(true);
    const moveComment = [...card.comments]
      .reverse()
      .find((item) => item.message.startsWith('Card moved from'));
    expect(moveComment?.authorType).toBe('system');
    expect(moveComment?.message).toBe(
      `Card moved from ${listTwoSource.title} to ${listTwoTarget.title} on [${boardTwo.title}](/boards/${boardTwo.id}/cards/${card.id}).`,
    );
  });

  it('records list move comments with the active board link (drag and drop)', () => {
    const event = {
      previousIndex: 0,
      currentIndex: 0,
      previousContainer: { data: listTwoSource.cardIds, id: listTwoSource.id },
      container: { data: listTwoTarget.cardIds, id: listTwoTarget.id },
    } as CdkDragDrop<string[]>;

    service.dropCard(event);

    const moveComment = [...card.comments]
      .reverse()
      .find((item) => item.message.startsWith('Card moved from'));
    expect(moveComment?.authorType).toBe('system');
    expect(moveComment?.message).toBe(
      `Card moved from ${listTwoSource.title} to ${listTwoTarget.title} on [${boardTwo.title}](/boards/${boardTwo.id}/cards/${card.id}).`,
    );
  });
});

describe('BoardService hierarchy management', () => {
  let service: BoardService;
  let boards: Board[];

  const makeBoard = (id: string, title: string): Board => ({
    id,
    title,
    createdAt: '2025-01-01T00:00:00Z',
    lists: [],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(BoardService);
    boards = [
      makeBoard('board-1', 'Root One'),
      makeBoard('board-2', 'Level Two'),
      makeBoard('board-3', 'Level Three'),
      makeBoard('board-4', 'Level Four'),
      makeBoard('board-5', 'Level Five'),
      makeBoard('board-6', 'Level Six'),
      makeBoard('board-7', 'Subtree Root'),
      makeBoard('board-8', 'Subtree Child'),
      makeBoard('board-9', 'Sibling Nine'),
      makeBoard('board-10', 'Sibling Ten'),
    ];
    service.boards = boards;
    service.board = boards[0];
    service.boardRelationships = [
      { parentBoardId: 'board-1', childBoardId: 'board-2', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-2', childBoardId: 'board-3', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-3', childBoardId: 'board-4', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-4', childBoardId: 'board-5', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-5', childBoardId: 'board-6', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-7', childBoardId: 'board-8', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-2', childBoardId: 'board-9', createdAt: '2025-01-01T00:00:00Z' },
      { parentBoardId: 'board-2', childBoardId: 'board-10', createdAt: '2025-01-01T00:00:00Z' },
    ];
  });

  it('blocks cycles and depth overflows when setting a board parent', () => {
    const cycleResult = service.setBoardParent('board-1', 'board-4', 7);
    expect(cycleResult.success).toBe(false);
    expect(cycleResult.error).toBe('This parent would create a cycle.');

    const depthResult = service.setBoardParent('board-7', 'board-6', 7);
    expect(depthResult.success).toBe(false);
    expect(depthResult.error).toBe('This parent would exceed depth 7.');
  });

  it('reorders children within the same parent', () => {
    const result = service.reorderBoardChildren('board-2', ['board-9', 'board-10', 'board-3']);
    expect(result.success).toBe(true);
    const ordered = service.boardRelationships
      .filter((item) => item.parentBoardId === 'board-2')
      .map((item) => item.childBoardId);
    expect(ordered).toEqual(['board-9', 'board-10', 'board-3']);
  });

  it('removes parent relationships when a board is set to root', () => {
    const result = service.setBoardParent('board-3', null, 7);
    expect(result.success).toBe(true);
    expect(service.boardRelationships.some((item) => item.childBoardId === 'board-3')).toBe(false);
  });
});
