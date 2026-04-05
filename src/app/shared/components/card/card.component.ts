import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <div [ngClass]="cardClasses()" class="bg-surface rounded-xl overflow-hidden">
      @if (title() || subtitle()) {
        <div class="px-6 py-4 border-b border-border">
          @if (title()) {
            <h3 class="text-lg font-semibold text-dark">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-muted mt-1">{{ subtitle() }}</p>
          }
        </div>
      }
      <div class="p-6" [ngClass]="{ '!p-0': noPadding() }">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="px-6 py-4 border-t border-border bg-primary/5">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly noPadding = input<boolean>(false);
  readonly hoverable = input<boolean>(false);

  hasFooter(): boolean {
    return true; // Always render footer slot, content decides
  }

  cardClasses(): Record<string, boolean> {
    const variant = this.variant();
    const base: Record<string, boolean> = {
      'transition-shadow hover:shadow-md': this.hoverable(),
    };

    const variants: Record<CardVariant, Record<string, boolean>> = {
      default: {
        'border border-border shadow-sm': true,
      },
      bordered: {
        'border-2 border-border': true,
      },
      elevated: {
        'shadow-lg': true,
      },
      flat: {
        '': true,
      },
    };

    return {
      ...base,
      ...variants[variant],
    };
  }
}
