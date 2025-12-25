import { Injectable } from '@angular/core';
import { marked, type Renderer, type Tokens } from 'marked';
import DOMPurify from 'dompurify';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly renderer = new marked.Renderer();
  private readonly allowedTags = [
    'a',
    'blockquote',
    'br',
    'code',
    'em',
    'h1',
    'h2',
    'h3',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'strong',
    'ul',
  ];
  private readonly allowedAttrs = ['href', 'src', 'alt', 'title', 'target', 'rel'];

  constructor() {
    this.renderer.html = (): string => '';
    this.renderer.heading = function (this: Renderer, token: Tokens.Heading): string {
      const safeLevel = Math.min(token.depth, 3);
      const text = this.parser.parseInline(token.tokens);
      return `<h${safeLevel}>${text}</h${safeLevel}>`;
    };
    this.renderer.link = function (this: Renderer, token: Tokens.Link): string {
      const text = this.parser.parseInline(token.tokens);
      const safeHref = token.href ?? '';
      const safeTitle = token.title ? ` title="${token.title}"` : '';
      return `<a href="${safeHref}"${safeTitle} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.use({ renderer: this.renderer });
  }

  render(markdown: string): string {
    const trimmed = markdown?.trim();
    if (!trimmed) {
      return '';
    }
    try {
      const normalized = this.normalizeMarkdown(trimmed);
      const raw = marked.parse(normalized) as string;
      return DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: this.allowedTags,
        ALLOWED_ATTR: this.allowedAttrs,
      });
    } catch {
      return DOMPurify.sanitize(trimmed, {
        ALLOWED_TAGS: this.allowedTags,
        ALLOWED_ATTR: this.allowedAttrs,
      });
    }
  }

  private normalizeMarkdown(markdown: string): string {
    return markdown.replace(
      /(?<!\\)\*(?!\s|\*)([^*\n]+?)(?<!\s)\*(?!\*)/g,
      '**$1**',
    );
  }
}
