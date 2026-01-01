import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-board-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './board-header.component.html',
  styleUrl: './board-header.component.scss',
})
export class BoardHeaderComponent {
  @Input() title = 'Kanban';
  @Input() subtitle = '';
  @Input() titleLink: string | null = null;
  @Input() showPanelTrigger = false;
  @Input() panelExpanded = false;
  @Input() panelDisabled = false;
  @Input() panelAriaLabel = 'Open board panel';
  @Output() panelToggle = new EventEmitter<void>();
}
