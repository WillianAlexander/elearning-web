import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [NgClass],
  template: `
    <div [ngClass]="containerClasses()" class="flex items-center justify-center">
      <div
        [ngClass]="spinnerClasses()"
        class="animate-spin rounded-full border-2 border-primary/20 border-t-primary"
      ></div>
      @if (text()) {
        <span class="ml-2 text-sm text-muted">{{ text() }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly text = input<string>();

  spinnerClasses(): Record<string, boolean> {
    const size = this.size();
    const sizes: Record<SpinnerSize, Record<string, boolean>> = {
      sm: { 'w-4 h-4': true },
      md: { 'w-6 h-6': true },
      lg: { 'w-8 h-8': true },
    };
    return sizes[size];
  }

  containerClasses(): Record<string, boolean> {
    const size = this.size();
    return {
      'gap-2': true,
    };
  }
}

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 p-8">
      <app-spinner [size]="size()" />
      @if (message()) {
        <p class="text-muted text-sm">{{ message() }}</p>
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
export class LoadingComponent {
  readonly size = input<SpinnerSize>('md');
  readonly message = input<string>();
}
