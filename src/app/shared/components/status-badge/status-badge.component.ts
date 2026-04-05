import { Component, input } from '@angular/core';

type CourseStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';

const STATUS_STYLES: Record<string, { classes: string }> = {
  draft: { classes: 'bg-alert/10 text-alert-dark border-alert/20' },
  pending_review: { classes: 'bg-accent/10 text-accent-dark border-accent/20' },
  published: { classes: 'bg-primary/10 text-primary border-primary/20' },
  archived: { classes: 'bg-bg text-muted border-border' },
  rejected: { classes: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_review: 'En Revision',
  published: 'Publicado',
  archived: 'Archivado',
  rejected: 'Rechazado',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      [class]="badgeClasses()"
      class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
    >
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
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  badgeClasses(): string {
    const style = STATUS_STYLES[this.status()] ?? STATUS_STYLES['draft'];
    return style.classes;
  }

  statusLabel(): string {
    return STATUS_LABELS[this.status()] ?? this.status();
  }
}
