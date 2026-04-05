import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-lesson-progress-list',
  standalone: true,
  template: `
    <ul class="divide-y divide-border rounded-lg border border-border bg-surface shadow-sm">
      @for (item of items(); track item.lessonId) {
        <li class="flex items-center gap-3 px-4 py-3">
          <!-- Completion checkbox -->
          <button
            type="button"
            [disabled]="item.completed || loading()"
            (click)="onComplete.emit(item.lessonId)"
            [class]="getCheckboxClasses(item.completed)"
            [attr.aria-label]="item.completed ? 'Leccion completada' : 'Marcar como completada'"
          >
            @if (item.completed) {
              <span class="material-symbols-outlined text-base text-white">check</span>
            }
          </button>

          <!-- Lesson info -->
          <div class="min-w-0 flex-1">
            <p [class]="getLessonClasses(item.completed)">
              {{ item.lesson?.title ?? 'Leccion ' + item.lessonId.slice(0, 8) }}
            </p>
            <div class="mt-0.5 flex items-center gap-3 text-xs text-muted">
              @if (item.lesson?.estimatedDuration) {
                <span>{{ item.lesson.estimatedDuration }} min</span>
              }
              @if (item.timeSpentSeconds > 0) {
                <span>{{ item.timeSpentSeconds / 60 | number: '1.0-0' }} min dedicados</span>
              }
            </div>
          </div>

          <!-- Completed date -->
          @if (item.completed && item.completedAt) {
            <span class="text-xs text-muted">
              {{ formatDate(item.completedAt) }}
            </span>
          }
        </li>
      }
    </ul>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LessonProgressListComponent {
  readonly items = input.required<any[]>();
  readonly loading = input<boolean>(false);
  readonly onComplete = output<string>();

  getCheckboxClasses(completed: boolean): string {
    const base =
      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors';
    return completed
      ? `${base} border-primary bg-primary text-white`
      : `${base} border-border hover:border-primary`;
  }

  getLessonClasses(completed: boolean): string {
    return completed
      ? 'text-sm font-medium text-muted line-through'
      : 'text-sm font-medium text-dark';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-EC');
  }
}
