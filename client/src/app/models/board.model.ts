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
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  lists: BoardList[];
}

export interface BoardsResponse {
  boards: Board[];
  cards: Card[];
}
