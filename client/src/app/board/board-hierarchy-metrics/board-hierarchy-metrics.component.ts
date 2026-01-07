import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { BoardService, RollupMetricResult, RollupScope } from '../../services/board.service';

@Component({
  selector: 'app-board-hierarchy-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-hierarchy-metrics.component.html',
  styleUrl: './board-hierarchy-metrics.component.scss',
})
export class BoardHierarchyMetricsComponent {
  @Input({ required: true }) boardId = '';
  readonly boardService = inject(BoardService);
  scope: RollupScope = 'descendants';

  setScope(scope: RollupScope): void {
    this.scope = scope;
  }

  get scopeLabel(): string {
    return this.scope === 'direct' ? 'Direct cards' : 'All descendants';
  }

  get metrics(): RollupMetricResult[] {
    if (!this.boardId) {
      return [];
    }
    return this.boardService.getBoardRollupMetrics(this.boardId, this.scope);
  }

  get totalCount(): number {
    const total = this.metrics.find((metric) => metric.id === 'card-total');
    return total?.value ?? 0;
  }
}
