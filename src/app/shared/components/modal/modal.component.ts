import { Component, input, output, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          (click)="closeOnBackdrop() && close()"
        ></div>

        <!-- Modal Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            [class]="modalClasses()"
            class="relative bg-surface rounded-xl shadow-xl w-full transform transition-all"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            @if (title() || hasHeader()) {
              <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                @if (title()) {
                  <h3 class="text-lg font-semibold text-dark">{{ title() }}</h3>
                }
                @if (showClose()) {
                  <button
                    (click)="close()"
                    class="p-1 rounded-lg hover:bg-primary/10 transition-colors text-muted hover:text-dark"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                }
              </div>
            }

            <!-- Content -->
            <div class="px-6 py-4" [class.max-h-96]="scrollable()">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (hasFooter()) {
              <div
                class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-primary/5"
              >
                <ng-content select="[slot=footer]"></ng-content>
              </div>
            }
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
export class ModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>();
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);
  readonly showClose = input<boolean>(true);
  readonly scrollable = input<boolean>(false);
  readonly hasHeader = input<boolean>(true);
  readonly hasFooter = input<boolean>(true);

  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen() && this.closeOnEscape()) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  modalClasses(): Record<string, boolean> {
    const size = this.size();
    const sizes: Record<string, Record<string, boolean>> = {
      sm: { 'max-w-sm': true },
      md: { 'max-w-md': true },
      lg: { 'max-w-lg': true },
      xl: { 'max-w-xl': true },
      full: { 'max-w-4xl': true },
    };
    return { ...sizes[size] };
  }
}
