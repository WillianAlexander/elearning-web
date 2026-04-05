import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CreateAnnouncementPayload {
  title: string;
  content: string;
}

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (submit)="handleSubmit($event)" class="space-y-3">
      <div>
        <label for="announcement-title" class="block text-sm font-medium text-on-surface mb-1">
          Titulo
        </label>
        <input
          id="announcement-title"
          type="text"
          [(ngModel)]="title"
          name="title"
          maxlength="255"
          placeholder="Titulo del anuncio"
          class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label for="announcement-content" class="block text-sm font-medium text-on-surface mb-1">
          Contenido
        </label>
        <textarea
          id="announcement-content"
          [(ngModel)]="content"
          name="content"
          rows="4"
          maxlength="10000"
          placeholder="Escribe el anuncio..."
          class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        [disabled]="!title.trim() || !content.trim() || isLoading()"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {{ isLoading() ? 'Publicando...' : 'Publicar anuncio' }}
      </button>
    </form>
  `,
})
export class AnnouncementFormComponent {
  @Input() courseId: string = '';
  @Input() isLoading = signal(false);
  @Output() submit = new EventEmitter<CreateAnnouncementPayload>();
  @Output() success = new EventEmitter<void>();

  title = '';
  content = '';

  handleSubmit(e: Event): void {
    e.preventDefault();
    if (!this.title.trim() || !this.content.trim()) return;

    this.submit.emit({
      title: this.title.trim(),
      content: this.content.trim(),
    });

    this.title = '';
    this.content = '';
    this.success.emit();
  }
}
