import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div [class]="containerClasses()">
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/20">
        <div
          class="h-full rounded-full bg-accent transition-all duration-300"
          [style.width.%]="clampedPercentage()"
        ></div>
      </div>
      @if (showLabel()) {
        <span class="text-xs font-medium text-muted"> {{ clampedPercentage() }}% </span>
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
export class ProgressBarComponent {
  readonly percentage = input.required<number>();
  readonly className = input<string>('');
  readonly showLabel = input<boolean>(true);

  readonly clampedPercentage = computed(() => Math.min(100, Math.max(0, this.percentage())));

  containerClasses(): string {
    return `flex items-center gap-2 ${this.className()}`;
  }
}
