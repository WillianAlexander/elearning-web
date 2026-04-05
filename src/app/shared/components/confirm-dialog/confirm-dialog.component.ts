import { Component, input, output } from '@angular/core';

type ConfirmVariant = 'danger' | 'default';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="mx-4 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-dark">{{ title() }}</h3>
          <p class="mt-2 text-sm text-muted">{{ message() }}</p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              (click)="cancel.emit()"
              class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg"
            >
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [class]="
                variant() === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary text-white hover:bg-primary/90'
              "
              class="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {{ confirmLabel() }}
            </button>
          </div>
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
export class ConfirmDialogComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('Confirmar');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');
  readonly variant = input<ConfirmVariant>('default');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
