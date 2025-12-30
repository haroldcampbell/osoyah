import { Routes } from '@angular/router';

import { BoardComponent } from './board/board.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: BoardComponent },
  { path: 'boards/:boardId', component: BoardComponent },
  { path: 'boards/:boardId/cards/:cardId', component: BoardComponent },
];
