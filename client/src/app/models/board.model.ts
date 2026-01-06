export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  comments: CardComment[];
  status: CardStatus;
}

export interface CardComment {
  id: string;
  message: string;
  createdAt: string;
  authorType: 'user' | 'system' | 'bot';
}

export interface CardStatus {
  state: 'incomplete' | 'completed';
  completedAt: string | null;
}

export interface CardRelationship {
  childCardId: string;
  parentCardId: string;
  createdAt: string;
}

export interface BoardRelationship {
  childBoardId: string;
  parentBoardId: string;
  createdAt: string;
}

export interface BoardList {
  id: string;
  title: string;
  cardIds: string[];
  isProcessDone: boolean;
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
  cardRelationships?: CardRelationship[];
  boardRelationships?: BoardRelationship[];
}
