import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Board } from '../models/board.model';

interface BoardsResponse {
  boards: Board[];
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly dataUrl = 'assets/data.json';
  private readonly http = inject(HttpClient);

  getBoards(): Observable<Board[]> {
    return this.http.get<BoardsResponse>(this.dataUrl).pipe(map((data) => data.boards));
  }
}
