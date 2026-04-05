import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="buttonClasses()"
      (click)="handleClick($event)"
      class="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      @if (loading()) {
        <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      }
      <ng-content></ng-content>
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
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  readonly clicked = output<MouseEvent>();

  buttonClasses(): Record<string, boolean> {
    const variant = this.variant();
    const size = this.size();

    const base = {
      'w-full': this.fullWidth(),
      'opacity-50 cursor-not-allowed': this.disabled() || this.loading(),
    };

    const variants: Record<ButtonVariant, Record<string, boolean>> = {
      primary: {
        'bg-primary text-white hover:bg-primary/90': true,
      },
      secondary: {
        'bg-surface text-dark border border-border hover:bg-primary/5': true,
      },
      outline: {
        'bg-transparent text-primary border border-primary hover:bg-primary/10': true,
      },
      ghost: {
        'bg-transparent text-dark hover:bg-primary/10': true,
      },
      danger: {
        'bg-red-600 text-white hover:bg-red-700': true,
      },
    };

    const sizes: Record<ButtonSize, Record<string, boolean>> = {
      sm: {
        'px-3 py-1.5 text-sm': true,
      },
      md: {
        'px-4 py-2 text-sm': true,
      },
      lg: {
        'px-6 py-3 text-base': true,
      },
    };

    return {
      ...base,
      ...variants[variant],
      ...sizes[size],
    };
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
