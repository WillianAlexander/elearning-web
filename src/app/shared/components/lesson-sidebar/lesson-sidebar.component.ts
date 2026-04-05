import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface SidebarModule {
  id: string;
  title: string;
  prerequisiteModuleId?: string | null;
  lessons: Array<{ id: string; title: string; type?: string }>;
}

@Component({
  selector: 'app-lesson-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside class="hidden w-72 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div class="shrink-0 border-b border-border px-4 py-3">
        <h3 class="text-sm font-bold text-dark">Contenido del curso</h3>
        <p class="mt-0.5 text-xs text-muted">
          {{ modules().length }} secciones • {{ totalLessons }} lecciones
        </p>
      </div>

      <div class="flex-1 overflow-y-auto">
        @for (mod of modules(); track mod.id; let mIdx = $index) {
          @let isExpanded = expandedModule() === mIdx;
          @let hasActiveLesson = mod.lessons.some(l => l.id === currentLessonId());

          <div>
            <button
              type="button"
              (click)="toggleModule(mIdx)"
              class="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors"
              [class.bg-gray-50]="isExpanded"
              [class.hover:bg-gray-50/50]="!isExpanded"
            >
              <div class="min-w-0 flex-1">
                <p
                  class="text-xs font-bold"
                  [class.text-dark]="hasActiveLesson"
                  [class.text-dark/80]="!hasActiveLesson"
                >
                  Sección {{ mIdx + 1 }}: {{ mod.title }}
                </p>
                <p class="mt-0.5 text-[10px] text-muted">
                  {{ mod.lessons.length }} lección{{ mod.lessons.length !== 1 ? 'es' : '' }}
                </p>
              </div>
              <span class="material-symbols-outlined text-xl text-muted shrink-0">
                {{ isExpanded ? 'expand_less' : 'expand_more' }}
              </span>
            </button>

            @if (isExpanded) {
              <div class="border-b border-border bg-surface">
                @for (lesson of mod.lessons; track lesson.id) {
                  @let isActive = lesson.id === currentLessonId();
                  @let lessonGlobalIdx = getLessonGlobalIndex(lesson.id);
                  @let isPast = lessonGlobalIdx < currentIndex();

                  <a
                    [href]="'/dashboard/courses/' + courseId() + '/lessons/' + lesson.id"
                    class="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors"
                    [class.bg-primary/10]="isActive"
                    [class.hover:bg-gray-50/50]="!isActive"
                  >
                    <span
                      class="material-symbols-outlined text-base mt-0.5 shrink-0"
                      [class.text-primary]="isPast || isActive"
                      [class.text-border]="!isPast && !isActive"
                    >
                      {{
                        isPast ? 'check_circle' : isActive ? 'play_arrow' : 'radio_button_unchecked'
                      }}
                    </span>
                    <p
                      class="text-xs"
                      [class.line-through]="isPast"
                      [class.text-muted]="isPast"
                      [class.font-semibold]="isActive"
                      [class.text-primary]="isActive"
                      [class.text-dark/80]="!isPast && !isActive"
                    >
                      {{ lesson.title }}
                    </p>
                  </a>
                }
              </div>
            }
          </div>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LessonSidebarComponent {
  readonly modules = input.required<SidebarModule[]>();
  readonly courseId = input.required<string>();
  readonly currentLessonId = input.required<string>();
  readonly allLessons = input<Array<{ id: string; title: string }>>([]);
  readonly currentIndex = input<number>(0);
  readonly completedLessonIds = input<Set<string>>(new Set());

  expandedModule = signal<number>(0);

  get totalLessons(): number {
    return this.modules().reduce((sum, m) => sum + m.lessons.length, 0);
  }

  toggleModule(mIdx: number): void {
    this.expandedModule.set(this.expandedModule() === mIdx ? -1 : mIdx);
  }

  getLessonGlobalIndex(lessonId: string): number {
    const allLessons = this.allLessons();
    return allLessons.findIndex((l) => l.id === lessonId);
  }
}
