export interface Card {
  id: string;
  title: string;
  description?: string;
}

export interface BoardList {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  lists: BoardList[];
}
