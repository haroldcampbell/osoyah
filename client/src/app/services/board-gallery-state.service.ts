import { Injectable } from '@angular/core';

import {
  BoardActivityState,
  BoardGalleryPreferences,
  BoardGallerySortMode,
} from '../models/board.model';

const LAST_OPENED_KEY = 'board:last-opened';
const SORT_MODE_KEY = 'board:gallery-sort';

@Injectable({ providedIn: 'root' })
export class BoardGalleryStateService {
  getLastOpenedMap(): Record<string, number> {
    return this.readActivityState().lastOpenedAtById;
  }

  setLastOpened(boardId: string, timestamp: number): void {
    const state = this.readActivityState();
    state.lastOpenedAtById[boardId] = timestamp;
    this.writeActivityState(state);
  }

  removeBoard(boardId: string): void {
    const state = this.readActivityState();
    if (!(boardId in state.lastOpenedAtById)) {
      return;
    }
    delete state.lastOpenedAtById[boardId];
    this.writeActivityState(state);
  }

  getSortMode(defaultMode: BoardGallerySortMode): BoardGallerySortMode {
    const raw = window.localStorage.getItem(SORT_MODE_KEY);
    if (!raw) {
      return defaultMode;
    }
    try {
      const prefs = JSON.parse(raw) as BoardGalleryPreferences;
      return prefs.sortMode ?? defaultMode;
    } catch {
      return defaultMode;
    }
  }

  setSortMode(sortMode: BoardGallerySortMode): void {
    this.writePreferences({ sortMode });
  }

  private readActivityState(): BoardActivityState {
    const fallback: BoardActivityState = { lastOpenedAtById: {} };
    return this.readJson(LAST_OPENED_KEY, fallback);
  }

  private writeActivityState(state: BoardActivityState): void {
    this.writeJson(LAST_OPENED_KEY, state);
  }

  private writePreferences(preferences: BoardGalleryPreferences): void {
    this.writeJson(SORT_MODE_KEY, preferences);
  }

  private readJson<T>(key: string, fallback: T): T {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}
