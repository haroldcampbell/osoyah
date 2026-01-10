import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { BoardService, RollupMetricResult, RollupScope } from '../../services/board.service';
import { HierarchyPanelStateService } from '../../services/hierarchy-panel-state.service';

@Component({
  selector: 'app-board-hierarchy-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-hierarchy-metrics.component.html',
  styleUrl: './board-hierarchy-metrics.component.scss',
})
export class BoardHierarchyMetricsComponent {
  readonly boardService = inject(BoardService);
  readonly hierarchyState = inject(HierarchyPanelStateService);
  scope: RollupScope = 'direct';

  setScope(scope: RollupScope): void {
    this.scope = scope;
  }

  get scopeLabel(): string {
    return this.scope === 'direct' ? 'Direct cards' : 'All descendants';
  }

  get metrics(): RollupMetricResult[] {
    const boardId = this.hierarchyState.boardId;
    if (!boardId) {
      return [];
    }
    return this.boardService.getBoardRollupMetrics(boardId, this.scope);
  }

  get totalCount(): number {
    const total = this.metrics.find((metric) => metric.id === 'card-total');
    return total?.value ?? 0;
  }
}
