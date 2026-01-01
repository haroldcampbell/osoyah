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
  createdAt: string;
  description?: string;
  lists: BoardList[];
  pinned?: boolean;
  archived?: boolean;
}

export type BoardGallerySortMode =
  | 'name-asc'
  | 'name-desc'
  | 'last-opened-desc'
  | 'last-opened-asc'
  | 'created-desc'
  | 'created-asc';

export interface BoardGalleryPreferences {
  sortMode: BoardGallerySortMode;
}

export interface BoardActivityState {
  lastOpenedAtById: Record<string, number>;
}

export interface BoardsResponse {
  boards: Board[];
  cards: Card[];
}
