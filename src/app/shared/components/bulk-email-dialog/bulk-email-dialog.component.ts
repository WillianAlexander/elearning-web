import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

interface BulkEmailPayload {
  subject: string;
  body: string;
}

@Component({
  selector: 'app-bulk-email-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-email-title"
      >
        <div class="mx-4 w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h2 id="bulk-email-title" class="flex items-center gap-2 text-lg font-bold text-dark">
              <app-icon name="mail" [size]="24" className="text-primary"></app-icon>
              Email masivo
            </h2>
            <button
              type="button"
              (click)="handleClose()"
              class="text-muted hover:text-dark"
              aria-label="Cerrar"
            >
              <app-icon name="close" [size]="20"></app-icon>
            </button>
          </div>

          <p class="text-sm text-muted mb-4">
            Se enviara a todos los usuarios inscritos (activos y completados) en este curso.
          </p>

          <form (submit)="handleSubmit($event)" class="space-y-4">
            <div>
              <label for="email-subject" class="block text-sm font-medium text-dark">
                Asunto
              </label>
              <input
                id="email-subject"
                type="text"
                [(ngModel)]="subject"
                name="subject"
                class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Asunto del email"
                required
              />
            </div>

            <div>
              <label for="email-body" class="block text-sm font-medium text-dark">
                Contenido
              </label>
              <textarea
                id="email-body"
                [(ngModel)]="body"
                name="body"
                rows="8"
                class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Escribe el contenido del email... (se admite HTML)"
                required
              ></textarea>
              <p class="mt-1 text-xs text-muted">
                Puedes usar HTML basico para formato (negrita, listas, enlaces).
              </p>
            </div>

            <div class="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                (click)="handleClose()"
                [disabled]="isLoading()"
                class="rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="isLoading() || !subject.trim() || !body.trim()"
                class="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                <app-icon name="send" [size]="16"></app-icon>
                {{ isLoading() ? 'Enviando...' : 'Enviar email' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BulkEmailDialogComponent {
  readonly open = input<boolean>(false);
  readonly courseId = input<string>('');
  readonly onClose = output<void>();
  readonly onSubmit = output<BulkEmailPayload>();
  readonly isLoading = input<boolean>(false);

  subject = '';
  body = '';

  handleSubmit(e: Event): void {
    e.preventDefault();
    if (!this.subject.trim() || !this.body.trim()) return;

    this.onSubmit.emit({
      subject: this.subject.trim(),
      body: this.body.trim(),
    });

    this.subject = '';
    this.body = '';
    this.onClose.emit();
  }

  handleClose(): void {
    if (!this.isLoading()) {
      this.subject = '';
      this.body = '';
      this.onClose.emit();
    }
  }
}
