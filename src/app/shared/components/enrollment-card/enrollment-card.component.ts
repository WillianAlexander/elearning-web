import { Component, input, output, signal } from '@angular/core';
import { EnrollmentStatusBadgeComponent } from '../enrollment-status-badge/enrollment-status-badge.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-enrollment-card',
  standalone: true,
  imports: [EnrollmentStatusBadgeComponent, ProgressBarComponent],
  template: `
    <a [href]="'/dashboard/courses/' + enrollment().courseId" [class]="cardClasses()">
      <!-- Thumbnail -->
      <div class="relative aspect-video w-full overflow-hidden bg-bg">
        @if (enrollment().course?.thumbnailUrl) {
          <img
            [src]="enrollment().course!.thumbnailUrl"
            [alt]="enrollment().course?.title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            [class.brightness-90]="isCompleted()"
          />
        } @else {
          <div class="flex h-full flex-col items-center justify-center gap-1 text-muted">
            <span class="material-symbols-outlined text-4xl text-primary/40">school</span>
            <span class="text-xs">Sin imagen</span>
          </div>
        }

        <!-- Completed overlay -->
        @if (isCompleted()) {
          <div class="absolute inset-0 flex items-center justify-center bg-black/10">
            <div
              class="flex items-center gap-2 rounded-full bg-alert px-4 py-2 text-sm font-bold text-dark shadow-lg"
            >
              <span class="material-symbols-outlined">emoji_events</span>
              Completado
            </div>
          </div>
        }

        <!-- Status badge -->
        <div class="absolute left-3 top-3">
          <app-enrollment-status-badge [status]="enrollment().status as any" />
        </div>

        <!-- Progress bar at bottom -->
        <div class="absolute inset-x-0 bottom-0 h-1 bg-black/20">
          <div
            [class]="isCompleted() ? 'bg-alert' : 'bg-accent'"
            class="h-full transition-all"
            [style.width.%]="enrollment().progressPercentage"
          ></div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-4">
        <h3
          class="truncate text-sm font-semibold group-hover:text-primary"
          [class.text-alert-dark]="isCompleted()"
        >
          {{ enrollment().course?.title }}
        </h3>

        @if (enrollment().course?.description) {
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {{ enrollment().course?.description }}
          </p>
        }

        <!-- Progress info -->
        <div class="mt-3 flex items-center gap-3">
          @if (isCompleted()) {
            <div class="flex flex-1 items-center gap-2 text-sm font-bold text-alert-dark">
              <span class="material-symbols-outlined text-lg">emoji_events</span>
              100% completado
            </div>
          } @else {
            <app-progress-bar
              [percentage]="enrollment().progressPercentage"
              [showLabel]="false"
              class="flex-1"
            />
            <span class="shrink-0 text-sm font-bold text-primary">
              {{ enrollment().progressPercentage }}%
            </span>
          }
        </div>

        <!-- Metadata -->
        <div class="mt-2.5 flex items-center justify-between text-xs text-muted">
          <span class="flex items-center gap-1">
            <span
              class="material-symbols-outlined text-base"
              [class.text-primary]="isCompleted()"
              [class.text-accent]="!isCompleted()"
              >check_circle</span
            >
            {{ enrollment().completedLessons }}/{{ enrollment().totalLessons }} lecciones
          </span>
          @if (enrollment().lastAccessedAt) {
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-base">schedule</span>
              {{ formatDate(enrollment().lastAccessedAt) }}
            </span>
          }
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class EnrollmentCardComponent {
  readonly enrollment = input.required<any>();
  readonly downloadCertificate = output<string>();

  isCompleted(): boolean {
    return this.enrollment().status === 'completed';
  }

  cardClasses(): string {
    const base =
      'group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md';
    return this.isCompleted()
      ? `${base} border-alert/50 bg-alert-light/40 hover:border-alert`
      : `${base} border-border bg-surface hover:border-primary/30`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
    });
  }

  onDownloadCertificate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.downloadCertificate.emit(this.enrollment().id);
  }
}
