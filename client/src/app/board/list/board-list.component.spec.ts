import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BoardListComponent } from './board-list.component';
import { BoardList } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

describe('BoardListComponent', () => {
  let fixture: ComponentFixture<BoardListComponent>;
  let boardService: BoardService;

  const mockList: BoardList = {
    id: 'list-1',
    title: 'Backlog',
    cards: [
      { id: 'card-1', title: 'Card One', description: 'First' },
      { id: 'card-2', title: 'Card Two', description: '' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardListComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardListComponent);
    boardService = TestBed.inject(BoardService);
    boardService.board = { id: 'board-1', title: 'Test Board', lists: [mockList] };
    fixture.componentInstance.list = mockList;
    fixture.detectChanges();
  });

  it('renders list title and cards', () => {
    const title = fixture.debugElement.query(By.css('[data-testid="list-title"]'));
    expect(title.nativeElement.textContent).toContain('Backlog');

    const cards = fixture.debugElement.queryAll(By.css('[data-testid="card"]'));
    expect(cards.length).toBe(2);
  });

  it('emits addCard when add button is clicked', () => {
    boardService.newCardTitles[mockList.id] = 'New card';
    const button = fixture.debugElement.query(By.css('[data-testid="add-card-button"]'));
    button.nativeElement.click();

    expect(mockList.cards.some((card) => card.title === 'New card')).toBe(true);
  });

  it('emits removeList when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    const button = fixture.debugElement.query(By.css('[data-testid="remove-list"]'));
    button.nativeElement.click();

    expect(boardService.board?.lists.length).toBe(0);
  });
});
