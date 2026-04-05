import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-12 text-center"
    >
      @if (icon()) {
        <div class="mb-4 text-muted">
          <ng-content select="[slot=icon]"></ng-content>
        </div>
      }
      <h3 class="text-sm font-semibold text-dark">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 text-sm text-muted">{{ description() }}</p>
      }
      @if (hasAction()) {
        <div class="mt-4">
          <ng-content select="[slot=action]"></ng-content>
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
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<boolean>(false);

  hasAction(): boolean {
    return true; // Always allow slot
  }
}
