import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { HierarchyNode, HierarchyParentOption } from '../board-hierarchy.types';

export interface BoardHierarchyPanelState {
  editMode: boolean;
  parentLabel: string;
  parentMenuOpen: boolean;
  parentOptions: HierarchyParentOption[];
  parentError: string;
  reorderItems: HierarchyNode[];
  isHierarchyBoard: boolean;
}

export type BoardHierarchyPanelAction =
  | { type: 'toggleEdit' }
  | { type: 'togglePanel' }
  | { type: 'toggleParentMenu' }
  | { type: 'setParent'; option: HierarchyParentOption }
  | { type: 'reorder'; event: CdkDragDrop<HierarchyNode[]> }
  | { type: 'openManager' };

@Component({
  selector: 'app-board-hierarchy-panel',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board-hierarchy-panel.component.html',
  styleUrl: './board-hierarchy-panel.component.scss',
})
export class BoardHierarchyPanelComponent {
  @Input() state!: BoardHierarchyPanelState;
  @Input() treeTemplate: TemplateRef<unknown> | null = null;

  @Output() action = new EventEmitter<BoardHierarchyPanelAction>();

  handleToggleEdit(): void {
    this.action.emit({ type: 'toggleEdit' });
  }

  handleTogglePanel(): void {
    this.action.emit({ type: 'togglePanel' });
  }

  handleToggleParentMenu(): void {
    this.action.emit({ type: 'toggleParentMenu' });
  }

  handleSetParent(option: HierarchyParentOption): void {
    this.action.emit({ type: 'setParent', option });
  }

  handleReorderDrop(event: CdkDragDrop<HierarchyNode[]>): void {
    this.action.emit({ type: 'reorder', event });
  }

  handleOpenManager(): void {
    this.action.emit({ type: 'openManager' });
  }
}
