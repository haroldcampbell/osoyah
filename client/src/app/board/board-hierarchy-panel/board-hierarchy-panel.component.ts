import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, inject } from '@angular/core';

import { HierarchyNode, HierarchyParentOption } from '../board-hierarchy.types';
import { HierarchyPanelStateService } from '../../services/hierarchy-panel-state.service';

@Component({
  selector: 'app-board-hierarchy-panel',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board-hierarchy-panel.component.html',
  styleUrl: './board-hierarchy-panel.component.scss',
})
export class BoardHierarchyPanelComponent {
  @Input() treeTemplate: TemplateRef<unknown> | null = null;
  readonly hierarchyState = inject(HierarchyPanelStateService);

  handleToggleEdit(): void {
    this.hierarchyState.toggleEdit();
  }

  handleTogglePanel(): void {
    this.hierarchyState.togglePanel();
  }

  handleToggleParentMenu(): void {
    this.hierarchyState.toggleParentMenu();
  }

  handleSetParent(option: HierarchyParentOption): void {
    this.hierarchyState.setParent(option);
  }

  handleReorderDrop(event: CdkDragDrop<HierarchyNode[]>): void {
    this.hierarchyState.handleReorderDrop(event);
  }

  handleOpenManager(): void {
    this.hierarchyState.openManager();
  }
}
