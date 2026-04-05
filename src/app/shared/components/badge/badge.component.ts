import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      [ngClass]="badgeClasses()"
      class="inline-flex items-center gap-1 font-medium rounded-full"
    >
      @if (dot()) {
        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly dot = input<boolean>(false);

  badgeClasses(): Record<string, boolean> {
    const variant = this.variant();
    const size = this.size();

    const variants: Record<BadgeVariant, Record<string, boolean>> = {
      default: {
        'bg-gray-100 text-gray-700': true,
      },
      primary: {
        'bg-primary/10 text-primary': true,
      },
      success: {
        'bg-green-100 text-green-700': true,
      },
      warning: {
        'bg-yellow-100 text-yellow-700': true,
      },
      danger: {
        'bg-red-100 text-red-700': true,
      },
      info: {
        'bg-blue-100 text-blue-700': true,
      },
    };

    const sizes: Record<BadgeSize, Record<string, boolean>> = {
      sm: {
        'px-2 py-0.5 text-xs': true,
      },
      md: {
        'px-2.5 py-1 text-xs': true,
      },
    };

    return {
      ...variants[variant],
      ...sizes[size],
    };
  }
}
