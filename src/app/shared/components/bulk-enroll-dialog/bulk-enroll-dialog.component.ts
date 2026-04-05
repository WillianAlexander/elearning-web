import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bulk-enroll-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="mx-4 w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
          @if (!result()) {
            <h2 class="text-lg font-bold text-dark">Inscripcion Masiva</h2>
            <p class="mt-1 text-sm text-muted">
              Curso: <code class="text-xs">{{ courseId() }}</code>
            </p>

            <div class="mt-4">
              <label class="block text-sm font-medium text-dark">
                IDs de usuarios (uno por linea o separados por coma)
              </label>
              <textarea
                class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                rows="6"
                [value]="inputValue()"
                (input)="onInputChange($event)"
                placeholder="uuid-1&#10;uuid-2&#10;uuid-3"
              ></textarea>
            </div>

            <div class="mt-4 flex justify-end gap-3">
              <button
                type="button"
                (click)="close.emit()"
                class="rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="loading() || !inputValue().trim()"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {{ loading() ? 'Inscribiendo...' : 'Inscribir' }}
              </button>
            </div>
          } @else {
            <div class="mt-4 space-y-2">
              <p class="text-sm text-accent">Inscriptos: {{ result()!.enrolled.length }}</p>
              <p class="text-sm text-alert-dark">
                Ya inscriptos (omitidos): {{ result()!.skipped.length }}
              </p>
              <p class="text-sm text-muted">Total procesados: {{ result()!.total }}</p>
            </div>
            <div class="mt-4 flex justify-end">
              <button
                type="button"
                (click)="close.emit()"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Cerrar
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class BulkEnrollDialogComponent {
  readonly open = input<boolean>(false);
  readonly courseId = input.required<string>();
  readonly loading = input<boolean>(false);
  readonly result = input<{ enrolled: string[]; skipped: string[]; total: number } | null>(null);

  readonly confirm = output<string[]>();
  readonly close = output<void>();

  inputValue = '';

  onInputChange(event: Event): void {
    this.inputValue = (event.target as HTMLTextAreaElement).value;
  }

  onSubmit(): void {
    const userIds = this.inputValue
      .split(/[\n,]+/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (userIds.length > 0) {
      this.confirm.emit(userIds);
    }
  }
}
