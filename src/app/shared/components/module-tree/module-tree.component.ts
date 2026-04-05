import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type?: string;
  estimatedDuration?: number;
}

@Component({
  selector: 'app-module-tree',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  template: `
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="sticky top-0 z-10 border-b border-border bg-surface/50 p-4 backdrop-blur-sm">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
          Estructura del Curso
        </h2>
        <button
          type="button"
          (click)="addModule.emit()"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <span class="material-symbols-outlined text-sm">add_circle</span>
          Añadir Módulo
        </button>
      </div>

      <!-- Tree content -->
      <div class="flex-1 space-y-4 overflow-y-auto p-3">
        @if (modules().length === 0) {
          <p class="py-4 text-center text-xs text-muted">Sin módulos. Agrega uno para empezar.</p>
        }

        <div cdkDropList (cdkDropListDropped)="onModuleDrop($event)">
          @for (mod of modules(); track mod.id) {
            <div
              cdkDrag
              [cdkDragData]="mod"
              class="group mb-2 rounded-md border border-border bg-surface"
            >
              <!-- Module header -->
              <div
                class="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-primary/5"
                [class.bg-primary-light]="selectedModuleId() === mod.id"
              >
                <!-- Drag handle -->
                <button
                  type="button"
                  cdkDragHandle
                  class="cursor-grab p-0.5 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Arrastrar módulo"
                >
                  <span class="material-symbols-outlined text-xl">drag_indicator</span>
                </button>

                <!-- Folder icon -->
                <span
                  class="material-symbols-outlined text-xl cursor-pointer"
                  [class.text-muted]="true"
                  (click)="toggleExpand(mod.id)"
                >
                  {{ expandedIds().has(mod.id) ? 'folder_open' : 'folder' }}
                </span>

                <!-- Module title -->
                <button
                  type="button"
                  (click)="selectModule(mod.id); toggleExpand(mod.id)"
                  class="flex-1 truncate text-left text-sm font-semibold text-dark"
                >
                  {{ mod.title }}
                </button>

                <!-- Module actions (visible on hover) -->
                <div
                  class="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    type="button"
                    (click)="moduleEdit.emit(mod.id)"
                    class="rounded p-1 hover:bg-primary/10"
                    aria-label="Editar módulo"
                  >
                    <span class="material-symbols-outlined text-base text-muted">edit</span>
                  </button>
                  <button
                    type="button"
                    (click)="addLesson.emit(mod.id)"
                    class="rounded p-1 hover:bg-primary/10"
                    aria-label="Agregar lección"
                  >
                    <span class="material-symbols-outlined text-base text-muted">add</span>
                  </button>
                  <button
                    type="button"
                    (click)="moduleDelete.emit(mod.id)"
                    class="rounded p-1 hover:bg-error-light"
                    aria-label="Eliminar módulo"
                  >
                    <span class="material-symbols-outlined text-base text-error">delete</span>
                  </button>
                </div>
              </div>

              <!-- Lessons list (expanded) -->
              @if (expandedIds().has(mod.id)) {
                <div class="ml-5 space-y-1 border-l border-border pl-4">
                  @if (mod.lessons.length === 0) {
                    <p class="px-2 py-2 text-xs text-muted">Sin lecciones</p>
                  }

                  @for (lesson of mod.lessons; track lesson.id) {
                    <div
                      class="group/lesson relative flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-primary/5"
                      [class.border-border]="selectedLessonId() === lesson.id"
                      [class.bg-surface]="selectedLessonId() === lesson.id"
                    >
                      <!-- Active indicator bar -->
                      @if (selectedLessonId() === lesson.id) {
                        <div class="absolute inset-y-0 left-0 w-1 rounded-l-md bg-primary" />
                      }

                      <!-- Drag handle -->
                      <span
                        class="material-symbols-outlined text-lg text-muted opacity-0 transition-opacity group-hover/lesson:opacity-100"
                      >
                        drag_indicator
                      </span>

                      <!-- Lesson icon -->
                      <span
                        class="material-symbols-outlined text-xl"
                        [class.text-primary]="selectedLessonId() === lesson.id"
                        [class.text-muted]="selectedLessonId() !== lesson.id"
                      >
                        {{ selectedLessonId() === lesson.id ? 'description' : 'play_circle' }}
                      </span>

                      <!-- Lesson info -->
                      <button
                        type="button"
                        (click)="lessonSelect.emit(lesson.id)"
                        class="min-w-0 flex-1 text-left"
                      >
                        <p class="truncate text-sm font-medium" [class.text-dark]="true">
                          {{ lesson.title }}
                        </p>
                        <p class="truncate text-[10px] text-muted">
                          {{ lesson.type ?? 'Texto' }}
                          @if (lesson.estimatedDuration) {
                            {{ ' • ' + lesson.estimatedDuration + ' min' }}
                          }
                        </p>
                      </button>

                      <!-- Delete lesson -->
                      <button
                        type="button"
                        (click)="lessonDelete.emit(lesson.id)"
                        class="hidden rounded p-0.5 text-muted transition-colors hover:text-error group-hover/lesson:block"
                        aria-label="Eliminar lección"
                      >
                        <span class="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  }

                  <!-- Add lesson button -->
                  <button
                    type="button"
                    (click)="addLesson.emit(mod.id)"
                    class="mt-1 flex w-full items-center gap-1 rounded px-4 py-1.5 text-xs text-primary transition-colors hover:bg-primary/5"
                  >
                    <span class="material-symbols-outlined text-base">add_circle</span>
                    Agregar lección
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class ModuleTreeComponent {
  readonly modules = input.required<CourseModule[]>();
  readonly selectedModuleId = input<string | null>(null);
  readonly selectedLessonId = input<string | null>(null);

  readonly moduleReorder = output<string[]>();
  readonly lessonReorder = output<{ moduleId: string; orderedIds: string[] }>();
  readonly moduleEdit = output<string>();
  readonly moduleDelete = output<string>();
  readonly addModule = output<void>();
  readonly addLesson = output<string>();
  readonly lessonEdit = output<string>();
  readonly lessonDelete = output<string>();
  readonly lessonSelect = output<string>();

  expandedIds = input<Set<string>>(new Set());
  selectModule = output<string>();

  toggleExpand(id: string): void {
    const current = this.expandedIds();
    const newSet = new Set(current);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
  }

  onModuleDrop(event: CdkDragDrop<CourseModule[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const modulesCopy = [...this.modules()];
      moveItemInArray(modulesCopy, event.previousIndex, event.currentIndex);
      this.moduleReorder.emit(modulesCopy.map((m) => m.id));
    }
  }
}
