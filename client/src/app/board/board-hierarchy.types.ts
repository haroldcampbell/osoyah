import { Board } from '../models/board.model';

export interface HierarchyNode {
  board: Board;
  children: HierarchyNode[];
}

export interface HierarchyParentOption {
  id: string | null;
  label: string;
  disabled: boolean;
  helper?: string;
}
