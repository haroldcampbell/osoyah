import { Routes } from '@angular/router';

import { BoardComponent } from './board/board.component';
import { BoardGalleryComponent } from './board-gallery/board-gallery.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'boards' },
  { path: 'boards', component: BoardGalleryComponent },
  { path: 'boards/:boardId', component: BoardComponent },
  { path: 'boards/:boardId/cards/:cardId', component: BoardComponent },
];
