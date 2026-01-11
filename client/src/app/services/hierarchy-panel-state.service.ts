import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Board } from '../models/board.model';
import { HierarchyNode, HierarchyParentOption } from '../board/board-hierarchy.types';
import { BoardService } from './board.service';

@Injectable({ providedIn: 'root' })
export class HierarchyPanelStateService {
  readonly hierarchyMaxDepth = 7;
  panelOpen = false;
  editMode = false;
  parentMenuOpen = false;
  parentError = '';
  hierarchyNodes: HierarchyNode[] = [];
  isNarrowViewport = window.matchMedia('(max-width: 800px)').matches;

  private readonly boardService = inject(BoardService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.boardService.inlineError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.scope === 'board-parent') {
          this.parentError = event.message;
        }
      });
  }

  get hierarchyParentLabel(): string {
    const board = this.boardService.board;
    if (!board) {
      return 'No parent';
    }
    const parent = this.boardService.getBoardParent(board.id);
    return parent ? parent.title : 'No parent (root)';
  }

  get hierarchyParentOptions(): HierarchyParentOption[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const options: HierarchyParentOption[] = [];
    const rootEligibility = this.boardService.getBoardParentEligibility(
      board.id,
      null,
      this.hierarchyMaxDepth,
    );
    options.push({
      id: null,
      label: 'No parent (root)',
      disabled: !rootEligibility.allowed,
      helper: this.getHierarchyParentHelper(rootEligibility.reason),
    });
    this.boardService.boards.forEach((candidate) => {
      const eligibility = this.boardService.getBoardParentEligibility(
        board.id,
        candidate.id,
        this.hierarchyMaxDepth,
      );
      options.push({
        id: candidate.id,
        label: candidate.title,
        disabled: !eligibility.allowed,
        helper: this.getHierarchyParentHelper(eligibility.reason),
      });
    });
    return options;
  }

  get hierarchyReorderItems(): HierarchyNode[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const node = this.findHierarchyNode(board.id, this.hierarchyNodes);
    return node?.children ?? [];
  }

  get hierarchyRoots(): HierarchyNode[] {
    return this.hierarchyNodes;
  }

  get breadcrumbBoards(): Board[] {
    const board = this.boardService.board;
    if (!board) {
      return [];
    }
    const { parentByChild, relatedIds } = this.getHierarchyMaps();
    if (!relatedIds.has(board.id)) {
      return [];
    }
    const path: Board[] = [];
    const visited = new Set<string>();
    let currentId: string | undefined = board.id;
    while (currentId) {
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);
      const currentBoard = this.boardService.getBoard(currentId);
      if (currentBoard) {
        path.unshift(currentBoard);
      }
      currentId = parentByChild.get(currentId);
    }
    return path;
  }

  get boardId(): string {
    return this.boardService.board?.id ?? '';
  }

  get isHierarchyBoard(): boolean {
    const board = this.boardService.board;
    if (!board) {
      return false;
    }
    return this.getHierarchyMaps().relatedIds.has(board.id);
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  openPanel(): void {
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen = false;
  }

  openManager(): void {
    this.editMode = true;
    this.parentMenuOpen = true;
    this.parentError = '';
    if (this.isNarrowViewport) {
      this.panelOpen = true;
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.parentMenuOpen = false;
      this.parentError = '';
    }
  }

  toggleParentMenu(): void {
    this.parentMenuOpen = !this.parentMenuOpen;
    if (this.parentMenuOpen) {
      this.parentError = '';
    }
  }

  handleReorderDrop(event: CdkDragDrop<HierarchyNode[]>): void {
    const board = this.boardService.board;
    if (!board) {
      return;
    }
    if (!this.editMode) {
      return;
    }
    if (event.previousContainer !== event.container) {
      return;
    }
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const orderedChildIds = event.container.data.map((child) => child.board.id);
    const result = this.boardService.reorderBoardChildren(board.id, orderedChildIds);
    if (!result.success) {
      moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
      return;
    }
    this.refreshHierarchy();
  }

  setParent(option: HierarchyParentOption): void {
    const board = this.boardService.board;
    if (!board || option.disabled) {
      return;
    }
    const result = this.boardService.setBoardParent(board.id, option.id, this.hierarchyMaxDepth);
    if (!result.success) {
      this.parentError = result.error ?? 'Unable to update parent.';
      return;
    }
    this.parentMenuOpen = false;
    this.parentError = '';
    this.refreshHierarchy();
  }

  refreshHierarchy(): void {
    this.hierarchyNodes = this.buildHierarchyRoots();
  }

  updateViewport(isNarrow: boolean): void {
    if (isNarrow !== this.isNarrowViewport) {
      this.isNarrowViewport = isNarrow;
      if (isNarrow) {
        this.panelOpen = false;
      }
    }
  }

  closeParentMenu(): void {
    this.parentMenuOpen = false;
  }

  private buildHierarchyRoots(): HierarchyNode[] {
    const { childrenByParent, rootIds } = this.getHierarchyMaps();
    const roots: HierarchyNode[] = [];
    rootIds.forEach((rootId) => {
      const node = this.buildHierarchyNode(rootId, childrenByParent, new Set());
      if (node) {
        roots.push(node);
      }
    });
    if (roots.length > 0) {
      return roots;
    }
    return [];
  }

  private buildHierarchyNode(
    boardId: string,
    childrenByParent: Map<string, string[]>,
    visited: Set<string>,
  ): HierarchyNode | null {
    if (visited.has(boardId)) {
      return null;
    }
    visited.add(boardId);
    const board = this.boardService.getBoard(boardId);
    if (!board) {
      return null;
    }
    const childrenIds = childrenByParent.get(boardId) ?? [];
    const children = childrenIds
      .map((childId) => this.buildHierarchyNode(childId, childrenByParent, new Set(visited)))
      .filter((child): child is HierarchyNode => !!child);
    return { board, children };
  }

  private findHierarchyNode(boardId: string, nodes: HierarchyNode[]): HierarchyNode | null {
    for (const node of nodes) {
      if (node.board.id === boardId) {
        return node;
      }
      const found = this.findHierarchyNode(boardId, node.children);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private getHierarchyMaps(): {
    parentByChild: Map<string, string>;
    childrenByParent: Map<string, string[]>;
    relatedIds: Set<string>;
    rootIds: string[];
  } {
    const relationships = this.boardService.boardRelationships ?? [];
    const parentByChild = new Map<string, string>();
    const childrenByParent = new Map<string, string[]>();
    const relatedIds = new Set<string>();

    relationships.forEach((relationship) => {
      parentByChild.set(relationship.childBoardId, relationship.parentBoardId);
      relatedIds.add(relationship.childBoardId);
      relatedIds.add(relationship.parentBoardId);
      const children = childrenByParent.get(relationship.parentBoardId) ?? [];
      if (!children.includes(relationship.childBoardId)) {
        children.push(relationship.childBoardId);
        childrenByParent.set(relationship.parentBoardId, children);
      }
    });

    const rootIds: string[] = [];
    relationships.forEach((relationship) => {
      const parentId = relationship.parentBoardId;
      if (!parentByChild.has(parentId) && !rootIds.includes(parentId)) {
        rootIds.push(parentId);
      }
    });

    return { parentByChild, childrenByParent, relatedIds, rootIds };
  }

  private getHierarchyParentHelper(reason?: 'self' | 'cycle' | 'depth'): string | undefined {
    if (!reason) {
      return undefined;
    }
    if (reason === 'self') {
      return 'Cannot parent a board to itself.';
    }
    if (reason === 'cycle') {
      return 'Would create a cycle.';
    }
    return `Would exceed depth ${this.hierarchyMaxDepth}.`;
  }
}
