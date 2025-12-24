import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  HostListener,
  Input,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BoardList, Card } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-card.component.html',
  styleUrl: './board-card.component.scss',
  host: {
    class: 'card',
  },
})
export class BoardCardComponent implements AfterViewChecked {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) list!: BoardList;
  readonly boardService = inject(BoardService);
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  private needsFocus = false;

  get isEditing(): boolean {
    return this.boardService.isEditingCard(this.list, this.card);
  }

  startTitleEdit(event?: Event): void {
    event?.stopPropagation();
    this.boardService.closeCardPanel();
    this.boardService.startCardEdit(this.list, this.card);
    this.needsFocus = true;
  }

  saveTitleEdit(): void {
    this.boardService.saveCardEdit(this.list, this.card);
  }

  cancelTitleEdit(): void {
    this.boardService.cancelCardEdit();
  }

  openDetails(): void {
    if (this.isEditing || this.boardService.editingCard) {
      return;
    }
    this.boardService.openCardPanel(this.list, this.card);
  }

  @HostListener('click')
  handleCardClick(): void {
    this.openDetails();
  }

  ngAfterViewChecked(): void {
    if (!this.isEditing || !this.needsFocus) {
      return;
    }
    const input = this.titleInput?.nativeElement;
    if (!input) {
      return;
    }
    this.needsFocus = false;
    setTimeout(() => {
      input.focus();
      input.select();
    });
  }

  renderDescriptionPreview(description: string): string {
    const trimmed = description.trim();
    if (!trimmed) {
      return '';
    }
    try {
      return this.renderMarkdownPreview(trimmed);
    } catch {
      return this.escapeHtml(trimmed);
    }
  }

  private renderMarkdownPreview(text: string): string {
    const escaped = this.escapeHtml(text);
    const lines = escaped.split(/\r?\n/);
    let html = '';
    let inList = false;

    for (const line of lines) {
      const match = line.match(/^\s*[-*]\s+(.*)$/);
      if (match) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${this.renderInlineMarkdown(match[1])}</li>`;
        continue;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }

      if (!line.trim()) {
        continue;
      }

      html += `<p>${this.renderInlineMarkdown(line)}</p>`;
    }

    if (inList) {
      html += '</ul>';
    }

    return html;
  }

  private renderInlineMarkdown(text: string): string {
    let output = text;
    output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
    output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/(^|\\s)(\\*|_)([^*_]+)\\2/g, '$1<em>$3</em>');
    output = output.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
    return output;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
