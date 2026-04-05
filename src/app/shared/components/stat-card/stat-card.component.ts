import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type StatColor = 'primary' | 'accent' | 'alert';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted">
          {{ label() }}
        </span>
        <div [ngClass]="iconBgClass()">
          <span [ngClass]="iconColorClass()" class="material-symbols-outlined text-lg">{{
            icon()
          }}</span>
        </div>
      </div>
      <span [ngClass]="valueClass()" class="mt-3 text-3xl font-bold">{{ value() }}</span>
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
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly color = input<StatColor>('primary');

  iconBgClass(): Record<string, boolean> {
    const color = this.color();
    return {
      'flex h-8 w-8 items-center justify-center rounded-lg': true,
      'bg-primary/10': color === 'primary' || color === 'accent',
      'bg-alert/10': color === 'alert',
    };
  }

  iconColorClass(): Record<string, boolean> {
    const color = this.color();
    return {
      'material-symbols-outlined': true,
      'text-primary': color === 'primary',
      'text-accent': color === 'accent',
      'text-alert-dark': color === 'alert',
    };
  }

  valueClass(): Record<string, boolean> {
    const color = this.color();
    return {
      'text-primary': color === 'primary',
      'text-accent': color === 'accent',
      'text-alert-dark': color === 'alert',
    };
  }
}
