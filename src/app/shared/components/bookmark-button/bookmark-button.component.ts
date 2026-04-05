import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bookmark-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="onToggle($event)"
      [disabled]="loading()"
      [class]="buttonClasses()"
      [attr.aria-label]="isBookmarked() ? 'Quitar marcador' : 'Agregar marcador'"
      [title]="isBookmarked() ? 'Quitar marcador' : 'Agregar marcador'"
    >
      <span
        class="material-symbols-outlined text-xl"
        [class.text-primary]="isBookmarked()"
        [class.text-muted]="!isBookmarked()"
      >
        bookmark
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class BookmarkButtonComponent {
  readonly lessonId = input<string>('');
  readonly isBookmarked = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly className = input<string>('');

  readonly toggle = output<void>();

  buttonClasses(): string {
    return `inline-flex items-center justify-center rounded-md p-1.5 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${this.className()}`;
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.toggle.emit();
  }
}
