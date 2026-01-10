import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import {
  BoardHierarchyPanelAction,
  BoardHierarchyPanelState,
} from '../board-hierarchy-panel/board-hierarchy-panel.component';
import { HierarchyNode, HierarchyParentOption } from '../board-hierarchy.types';

@Component({
  selector: 'app-board-hierarchy-drawer',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board-hierarchy-drawer.component.html',
  styleUrl: './board-hierarchy-drawer.component.scss',
})
export class BoardHierarchyDrawerComponent {
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
