import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CoursesService } from '../../../../../core/services/courses.service';
import { EnrollmentsService } from '../../../../../core/services/enrollments.service';
import { ContentBlocksApiService } from '../../../../../core/services/content-blocks-api.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { LessonNotesPanelComponent } from '../../../../../shared/components/lesson-notes-panel/lesson-notes-panel.component';
import { BookmarksApiService } from '../../../../../core/services/bookmarks-api.service';

interface ContentBlock {
  id: string;
  type: string;
  content: any;
}
interface Lesson {
  id: string;
  title: string;
}
interface CourseModule {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}
interface Enrollment {
  id: string;
  courseId: string;
}
interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, LessonNotesPanelComponent],
  template: `
    <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div class="hidden lg:flex w-72 flex-col border-r border-border bg-surface shrink-0">
        <div class="shrink-0 border-b border-border px-4 py-3">
          <a
            routerLink="/dashboard/courses/{{ courseId() }}"
            class="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
          >
            <app-icon name="arrow_back" [size]="18"></app-icon> Volver al curso
          </a>
        </div>
        <div class="flex-1 overflow-y-auto">
          @for (mod of modules(); track mod.id; let mIdx = $index) {
            <div>
              <button
                type="button"
                (click)="toggleSidebarModule(mod.id)"
                class="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left"
                [class.bg-bg]="isSidebarModuleExpanded(mod.id)"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-dark truncate">
                    Seccion {{ mIdx + 1 }}: {{ mod.title }}
                  </p>
                  <p class="mt-0.5 text-[10px] text-muted">{{ mod.lessons.length }} leccion</p>
                </div>
                <app-icon
                  [name]="isSidebarModuleExpanded(mod.id) ? 'expand_less' : 'expand_more'"
                  [size]="20"
                  className="shrink-0 text-muted"
                ></app-icon>
              </button>
              @if (isSidebarModuleExpanded(mod.id)) {
                <div class="border-b border-border bg-surface">
                  @for (lesson of mod.lessons; track lesson.id) {
                    @if (isLessonCompleted(lesson.id)) {
                      <div class="flex w-full items-start gap-3 px-4 py-2.5 text-left opacity-60">
                        <app-icon
                          name="check_circle"
                          [size]="16"
                          className="mt-0.5 shrink-0 text-muted"
                        ></app-icon>
                        <p class="text-xs text-muted line-through truncate">{{ lesson.title }}</p>
                      </div>
                    } @else {
                      <a
                        routerLink="/dashboard/courses/{{ courseId() }}/lessons/{{ lesson.id }}"
                        class="flex w-full items-start gap-3 px-4 py-2.5 text-left"
                        [class.bg-primary-light]="lesson.id === lessonId()"
                      >
                        <app-icon
                          [name]="
                            lesson.id === lessonId() ? 'play_arrow' : 'radio_button_unchecked'
                          "
                          [size]="16"
                          [className]="
                            lesson.id === lessonId()
                              ? 'mt-0.5 shrink-0 text-primary'
                              : 'mt-0.5 shrink-0 text-border'
                          "
                        ></app-icon>
                        <p class="text-xs text-dark truncate">{{ lesson.title }}</p>
                      </a>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
      <div class="flex flex-1 flex-col overflow-hidden">
        @if (loading()) {
          <div class="flex flex-1 items-center justify-center">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            ></div>
          </div>
        } @else {
          <div class="border-b border-border bg-surface px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-muted mb-1">Leccion</p>
                <h2 class="text-xl font-bold text-dark">{{ lesson()?.title }}</h2>
              </div>
              <button
                type="button"
                (click)="markComplete()"
                [disabled]="completed()"
                class="flex items-center gap-2 rounded-md px-4 py-2 font-medium"
                [class.bg-primary]="!completed()"
                [class.text-white]="!completed()"
                [class.bg-primary-light]="completed()"
                [class.text-primary]="completed()"
                [class.opacity-50]="completed()"
                [disabled]="completed()"
              >
                <app-icon [name]="completed() ? 'check_circle' : 'check'" [size]="20"></app-icon
                >{{ completed() ? 'Completado' : 'Marcar como completado' }}
              </button>
            </div>
          </div>
          <div class="border-b border-border px-6">
            <nav class="flex gap-1 -mb-px">
              <button
                type="button"
                (click)="setTab('content')"
                class="border-b-2 px-4 py-3 text-sm font-medium"
                [class.border-primary]="activeTab() === 'content'"
                [class.text-primary]="activeTab() === 'content'"
                [class.border-transparent]="activeTab() !== 'content'"
                [class.text-muted]="activeTab() !== 'content'"
              >
                Contenido
              </button>
              @if (hasQuiz()) {
                <button
                  type="button"
                  (click)="setTab('quiz')"
                  class="border-b-2 px-4 py-3 text-sm font-medium"
                  [class.border-primary]="activeTab() === 'quiz'"
                  [class.text-primary]="activeTab() === 'quiz'"
                  [class.border-transparent]="activeTab() !== 'quiz'"
                  [class.text-muted]="activeTab() !== 'quiz'"
                >
                  Quiz
                </button>
              }
              <button
                type="button"
                (click)="setTab('notes')"
                class="border-b-2 px-4 py-3 text-sm font-medium"
                [class.border-primary]="activeTab() === 'notes'"
                [class.text-primary]="activeTab() === 'notes'"
                [class.border-transparent]="activeTab() !== 'notes'"
                [class.text-muted]="activeTab() !== 'notes'"
              >
                Notas
              </button>
            </nav>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            @if (activeTab() === 'content') {
              <div class="space-y-6 max-w-4xl">
                @for (block of blocks(); track block.id) {
                  @switch (block.type) {
                    @case ('text') {
                      <div
                        class="prose prose-sm max-w-none text-dark"
                        [innerHTML]="block.content?.html"
                      ></div>
                    }
                    @case ('video') {
                      <div class="aspect-video rounded-lg bg-slate-900">
                        <iframe
                          [src]="getYouTubeEmbedUrl(block.content?.url)"
                          class="h-full w-full border-0"
                          allow="autoplay"
                        ></iframe>
                      </div>
                    }
                    @case ('image') {
                      <div class="rounded-lg">
                        <img
                          [src]="block.content?.url"
                          [alt]="block.content?.alt"
                          class="max-w-full rounded-lg"
                        />
                      </div>
                    }
                    @case ('pdf') {
                      <div class="rounded-lg border border-border p-4">
                        <a
                          [href]="block.content?.url"
                          target="_blank"
                          class="text-sm font-medium text-primary"
                          ><app-icon name="picture_as_pdf" [size]="20"></app-icon>Ver PDF</a
                        >
                      </div>
                    }
                    @case ('code') {
                      <pre
                        class="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
                      ><code>{{block.content?.code}}</code></pre>
                    }
                    @case ('embed') {
                      <div class="aspect-video rounded-lg">
                        <iframe [src]="block.content?.url" class="h-full w-full border-0"></iframe>
                      </div>
                    }
                    @default {
                      <div class="rounded-lg border border-border bg-bg p-4 text-sm text-muted">
                        Tipo: {{ block.type }}
                      </div>
                    }
                  }
                }
              </div>
            }
            @if (activeTab() === 'quiz') {
              <div class="max-w-2xl space-y-6">
                @for (qBlock of quizBlocks(); track qBlock.id) {
                  <div class="rounded-lg border border-border bg-bg p-6">
                    <h3 class="text-lg font-semibold text-dark">Quiz</h3>
                    <p class="text-sm text-muted mt-1">
                      {{ qBlock.content?.questions?.length ?? 0 }} preguntas
                    </p>
                    <p class="text-sm text-muted mt-2">
                      Puntaje minimo: {{ qBlock.content?.passingScore ?? 70 }}%
                    </p>
                  </div>
                }
                @if (quizBlocks().length === 0) {
                  <div
                    class="rounded-lg border border-border bg-bg p-6 text-center text-sm text-muted"
                  >
                    No hay quizzes en esta leccion.
                  </div>
                }
              </div>
            }
            @if (activeTab() === 'notes') {
              <div class="max-w-2xl">
                <app-lesson-notes-panel [lessonId]="lessonId()"></app-lesson-notes-panel>
              </div>
            }
          </div>
          <div class="border-t border-border px-6 py-4 flex justify-between">
            @if (prevLessonId()) {
              <a
                routerLink="/dashboard/courses/{{ courseId() }}/lessons/{{ prevLessonId() }}"
                class="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
                ><app-icon name="chevron_left" [size]="20"></app-icon>Anterior</a
              >
            } @else {
              <div></div>
            }
            @if (nextLessonId()) {
              <a
                routerLink="/dashboard/courses/{{ courseId() }}/lessons/{{ nextLessonId() }}"
                class="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
                >Siguiente<app-icon name="chevron_right" [size]="20"></app-icon
              ></a>
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
export class LessonViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);
  private enrollmentsService = inject(EnrollmentsService);
  private contentBlocksService = inject(ContentBlocksApiService);
  private bookmarksService = inject(BookmarksApiService);

  courseId = signal('');
  lessonId = signal('');
  lesson = signal<Lesson | null>(null);
  blocks = signal<ContentBlock[]>([]);
  modules = signal<CourseModule[]>([]);
  enrollment = signal<Enrollment | null>(null);
  lessonProgress = signal<LessonProgress[]>([]);
  activeTab = signal<'content' | 'quiz' | 'notes'>('content');
  loading = signal(true);
  completing = signal(false);
  completed = signal(false);
  sidebarExpandedModules = signal<Set<string>>(new Set());

  quizBlocks = computed(() => this.blocks().filter((b) => b.type === 'quiz'));
  hasQuiz = computed(() => this.quizBlocks().length > 0);

  allLessons = computed(() => {
    const l: { id: string; title: string }[] = [];
    for (const m of this.modules())
      for (const lesson of m.lessons) l.push({ id: lesson.id, title: lesson.title });
    return l;
  });
  currentLessonIndex = computed(() => this.allLessons().findIndex((l) => l.id === this.lessonId()));
  prevLessonId = computed(() => {
    const idx = this.currentLessonIndex();
    return idx > 0 ? this.allLessons()[idx - 1]?.id : null;
  });
  nextLessonId = computed(() => {
    const idx = this.currentLessonIndex();
    const l = this.allLessons();
    return idx >= 0 && idx < l.length - 1 ? l[idx + 1]?.id : null;
  });

  ngOnInit() {
    const cid = this.route.snapshot.paramMap.get('id') ?? '';
    const lid = this.route.snapshot.paramMap.get('lessonId') ?? '';
    this.courseId.set(cid);
    this.lessonId.set(lid);
    if (cid && lid) this.loadData(cid, lid);
  }

  async loadData(cid: string, lid: string) {
    try {
      const curriculum = await firstValueFrom(this.coursesService.getCourseCurriculum(cid));
      const mods = (curriculum as any)?.modules || [];
      this.modules.set(mods);
      if (mods.length) this.sidebarExpandedModules.set(new Set([mods[0].id]));
      const lesson = await firstValueFrom(this.coursesService.getLesson(lid));
      this.lesson.set(lesson as Lesson);
      const blocks = await firstValueFrom(this.contentBlocksService.list(lid));
      this.blocks.set(blocks);
      const enrollments = await firstValueFrom(this.enrollmentsService.getMyEnrollmentsList());
      const enrollment = enrollments.find((e) => e.courseId === cid);
      this.enrollment.set(enrollment ?? null);
      if (enrollment) {
        const progress = await firstValueFrom(this.enrollmentsService.getProgress(enrollment.id));
        this.lessonProgress.set(progress);
        this.completed.set(progress.find((p) => p.lessonId === lid)?.isCompleted ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async markComplete() {
    const cid = this.courseId();
    const lid = this.lessonId();
    if (!cid || !lid) return;
    this.completing.set(true);
    try {
      await firstValueFrom(this.enrollmentsService.completeLesson(cid, lid));
      this.completed.set(true);
    } catch (e) {
      console.error(e);
    } finally {
      this.completing.set(false);
    }
  }

  setTab(t: 'content' | 'quiz' | 'notes') {
    this.activeTab.set(t);
  }
  toggleSidebarModule(id: string) {
    this.sidebarExpandedModules.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  isSidebarModuleExpanded(id: string): boolean {
    return this.sidebarExpandedModules().has(id);
  }
  isLessonCompleted(id: string): boolean {
    return this.lessonProgress().some((p) => p.lessonId === id && p.isCompleted);
  }
  getYouTubeEmbedUrl(url: string | undefined): string {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  }
}
