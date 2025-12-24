export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  comments: CardComment[];
}

export interface CardComment {
  id: string;
  message: string;
  createdAt: string;
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
