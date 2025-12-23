import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BoardCardComponent } from './board-card.component';
import { BoardList, Card } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

describe('BoardCardComponent', () => {
  let fixture: ComponentFixture<BoardCardComponent>;
  let component: BoardCardComponent;
  let boardService: BoardService;

  const mockCard: Card = { id: 'card-1', title: 'Card One', description: 'First' };
  const mockList: BoardList = { id: 'list-1', title: 'Backlog', cards: [mockCard] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardCardComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardCardComponent);
    component = fixture.componentInstance;
    boardService = TestBed.inject(BoardService);
    boardService.board = { id: 'board-1', title: 'Test Board', lists: [mockList] };
    component.card = mockCard;
    component.list = mockList;
    fixture.detectChanges();
  });

  it('emits startEdit when edit button is clicked', () => {
    const button = fixture.debugElement.query(By.css('[data-testid="edit-card"]'));
    button.nativeElement.click();

    expect(boardService.editingCard?.cardId).toBe(mockCard.id);
  });

  it('emits remove when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    const button = fixture.debugElement.query(By.css('[data-testid="remove-card"]'));
    button.nativeElement.click();

    expect(mockList.cards.length).toBe(0);
  });

  it('updates editing fields when in edit mode', () => {
    boardService.editingCard = { listId: mockList.id, cardId: mockCard.id };
    boardService.editingCardTitle = mockCard.title;
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css('[data-testid="card-title-input"]'),
    ).nativeElement;
    input.value = 'Updated title';
    input.dispatchEvent(new Event('input'));

    expect(boardService.editingCardTitle).toBe('Updated title');
  });
});
