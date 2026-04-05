import { Component, input, output } from '@angular/core';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-course-catalog-card',
  standalone: true,
  imports: [ProgressBarComponent],
  template: `
    <div [class]="cardClasses()">
      <!-- Category Strip -->
      <div [class]="'h-1.5 w-full ' + categoryColor()"></div>

      <div class="flex flex-1 flex-col p-5">
        <!-- Category Label -->
        @if (course().category) {
          <div class="mb-2 flex items-start justify-between">
            <span [class]="'text-xs font-semibold uppercase tracking-wider ' + categoryTextColor()">
              {{ course().category.name }}
            </span>
          </div>
        }

        <!-- Title -->
        <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-dark group-hover:text-primary">
          {{ course().title }}
        </h3>

        <!-- Description -->
        @if (course().description) {
          <p class="mb-4 line-clamp-2 flex-1 text-sm text-muted">
            {{ course().description }}
          </p>
        }

        <!-- Instructor -->
        @if (course().createdBy) {
          <div class="mb-3 flex items-center gap-2">
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
            >
              {{ course().createdBy.firstName.charAt(0)
              }}{{ course().createdBy.lastName.charAt(0) }}
            </div>
            <span class="text-xs font-medium text-muted">
              {{ course().createdBy.firstName }} {{ course().createdBy.lastName }}
            </span>
          </div>
        }

        <!-- Meta: Duration + Difficulty -->
        <div class="mb-5 flex items-center gap-4 text-xs font-medium text-muted">
          @if (course().estimatedDuration) {
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">schedule</span>
              <span>{{ formatDuration(course().estimatedDuration) }}</span>
            </div>
          }
          @if (course().difficultyLevel) {
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">signal_cellular_alt</span>
              <span class="capitalize">{{ course().difficultyLevel }}</span>
            </div>
          }
        </div>

        <!-- Action Button -->
        @if (showEnrollButton()) {
          <div class="mt-auto">
            @if (alreadyEnrolled()) {
              @if (enrollmentStatus() === 'completed') {
                <a
                  [href]="'/dashboard/courses/' + course().id"
                  class="flex w-full items-center justify-center gap-2 rounded bg-alert px-4 py-2 text-sm font-bold text-dark shadow-sm transition-colors hover:bg-alert/80"
                >
                  <span class="material-symbols-outlined text-base">emoji_events</span>
                  Completado
                </a>
              } @else {
                <a
                  [href]="'/dashboard/courses/' + course().id"
                  class="flex w-full items-center justify-center gap-2 rounded border border-accent bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  <span class="material-symbols-outlined text-base">play_circle</span>
                  En curso
                </a>
              }
            } @else {
              <button
                type="button"
                (click)="onEnroll.emit(course().id)"
                [disabled]="enrolling()"
                class="w-full rounded border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                {{ enrolling() ? 'Inscribiendo...' : 'Inscribirse' }}
              </button>
            }
          </div>
        }
      </div>
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
export class CourseCatalogCardComponent {
  readonly course = input.required<any>();
  readonly alreadyEnrolled = input<boolean>(false);
  readonly enrollmentStatus = input<string>();
  readonly enrolling = input<boolean>(false);
  readonly showEnrollButton = input<boolean>(true);

  readonly onEnroll = output<string>();

  cardClasses(): string {
    const isCompleted = this.enrollmentStatus() === 'completed';
    const base =
      'group relative flex h-full flex-col overflow-hidden rounded-md border bg-surface transition-all hover:shadow-lg';
    return isCompleted
      ? `${base} border-alert/50 hover:border-alert`
      : `${base} border-border hover:border-primary/30`;
  }

  categoryColor(): string {
    const name = this.course().category?.name;
    if (!name) return 'bg-accent';
    const colors = [
      'bg-accent',
      'bg-red-500',
      'bg-purple-600',
      'bg-blue-600',
      'bg-orange-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] ?? 'bg-accent';
  }

  categoryTextColor(): string {
    const name = this.course().category?.name;
    if (!name) return 'text-accent';
    const colors = [
      'text-accent',
      'text-red-500',
      'text-purple-600',
      'text-blue-600',
      'text-orange-500',
      'text-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] ?? 'text-accent';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (remaining === 0) return `${hours}h`;
    return `${hours}h ${remaining}m`;
  }
}
