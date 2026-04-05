import { Component, input, output } from '@angular/core';

type EnrollmentStatus = 'all' | 'active' | 'completed' | 'dropped';

@Component({
  selector: 'app-enrollment-filters',
  standalone: true,
  template: `
    <div class="flex gap-1 rounded-xl bg-bg p-1">
      @for (option of filterOptions; track option.value) {
        <button
          type="button"
          (click)="statusChange.emit(option.value)"
          [class]="getButtonClasses(option.value)"
        >
          <span
            class="material-symbols-outlined text-base"
            [class.text-primary]="activeStatus() === option.value"
          >
            {{ option.icon }}
          </span>
          {{ option.label }}
        </button>
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
export class EnrollmentFiltersComponent {
  readonly activeStatus = input.required<EnrollmentStatus>();
  readonly statusChange = output<EnrollmentStatus>();

  readonly filterOptions = [
    { value: 'all' as const, label: 'Todos', icon: 'apps' },
    { value: 'active' as const, label: 'En curso', icon: 'play_circle' },
    { value: 'completed' as const, label: 'Completados', icon: 'check_circle' },
    { value: 'dropped' as const, label: 'Abandonados', icon: 'cancel' },
  ];

  getButtonClasses(value: EnrollmentStatus): string {
    const isActive = this.activeStatus() === value;
    return `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isActive ? 'bg-surface text-dark shadow-sm' : 'text-muted hover:text-dark'
    }`;
  }
}
