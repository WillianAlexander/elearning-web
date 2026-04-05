import { Component, input } from '@angular/core';

type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'expired';

const STATUS_STYLES: Record<EnrollmentStatus, string> = {
  active: 'bg-accent/10 text-accent',
  completed: 'bg-primary/10 text-primary',
  dropped: 'bg-border text-muted',
  expired: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  active: 'En curso',
  completed: 'Completado',
  dropped: 'Abandonado',
  expired: 'Expirado',
};

@Component({
  selector: 'app-enrollment-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      {{ statusLabel() }}
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
export class EnrollmentStatusBadgeComponent {
  readonly status = input.required<EnrollmentStatus>();

  badgeClasses(): string {
    const style = STATUS_STYLES[this.status() as EnrollmentStatus] ?? '';
    return `inline-flex items-center rounded px-2 py-1 text-xs font-medium ${style}`;
  }

  statusLabel(): string {
    return STATUS_LABELS[this.status() as EnrollmentStatus] ?? this.status();
  }
}
