import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CoursesService } from '../../../../../core/services/courses.service';
import { ModulesApiService } from '../../../../../core/services/modules-api.service';
import { ContentBlocksApiService } from '../../../../../core/services/content-blocks-api.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';

interface Course {
  id: string;
  title: string;
  status: string;
}

interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string }[];
}

interface ContentBlock {
  id: string;
  lessonId: string;
  type: string;
  content: any;
  order: number;
}

const TAB_ID = {
  CONTENT: 'content',
  QUIZ: 'quiz',
} as const;

type TabId = (typeof TAB_ID)[keyof typeof TAB_ID];

@Component({
  selector: 'app-course-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, StatusBadgeComponent],
  template: `
    <div class="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      <!-- Preview banner -->
      <div class="flex shrink-0 items-center justify-center gap-2 bg-alert px-4 py-1.5">
        <app-icon name="visibility" [size]="14" className="text-dark"></app-icon>
        <span class="text-xs font-semibold text-dark"> Vista previa — modo estudiante </span>
      </div>

      <!-- Main workspace -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left sidebar: course outline -->
        <aside class="hidden w-72 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          <div class="shrink-0 border-b border-border px-4 py-3">
            <h3 class="text-sm font-bold text-dark">Contenido del curso</h3>
            <p class="mt-0.5 text-xs text-muted">
              {{ modules().length }} secciones • {{ totalLessons() }} lecciones
            </p>
          </div>

          <div class="flex-1 overflow-y-auto">
            @for (mod of modules(); track mod.id; let mIdx = $index) {
              <div>
                <button
                  type="button"
                  (click)="toggleModule(mIdx)"
                  class="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors"
                  [class.bg-bg]="expandedModule() === mIdx"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-dark truncate">
                      Sección {{ mIdx + 1 }}: {{ mod.title }}
                    </p>
                    <p class="mt-0.5 text-[10px] text-muted">
                      {{ mod.lessons.length }} lección{{ mod.lessons.length !== 1 ? 'es' : '' }}
                    </p>
                  </div>
                  <app-icon
                    [name]="expandedModule() === mIdx ? 'expand_less' : 'expand_more'"
                    [size]="20"
                    className="shrink-0 text-muted"
                  ></app-icon>
                </button>

                @if (expandedModule() === mIdx) {
                  <div class="border-b border-border bg-surface">
                    @for (lesson of mod.lessons; track lesson.id; let lIdx = $index) {
                      <button
                        type="button"
                        (click)="selectLesson(mIdx, lIdx)"
                        class="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors"
                        [class.bg-primary-light]="
                          activeModuleIndex() === mIdx && activeLessonIndex() === lIdx
                        "
                      >
                        <app-icon
                          [name]="
                            activeModuleIndex() === mIdx && activeLessonIndex() === lIdx
                              ? 'play_arrow'
                              : 'radio_button_unchecked'
                          "
                          [size]="16"
                          [className]="
                            activeModuleIndex() === mIdx && activeLessonIndex() === lIdx
                              ? 'mt-0.5 shrink-0 text-primary'
                              : 'mt-0.5 shrink-0 text-muted'
                          "
                        ></app-icon>
                        <p
                          class="text-xs truncate"
                          [class.font-semibold]="
                            activeModuleIndex() === mIdx && activeLessonIndex() === lIdx
                          "
                          [class.text-primary]="
                            activeModuleIndex() === mIdx && activeLessonIndex() === lIdx
                          "
                          [class.text-dark]="
                            activeModuleIndex() !== mIdx || activeLessonIndex() !== lIdx
                          "
                        >
                          {{ lesson.title }}
                        </p>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </aside>

        <!-- Right: hero + tabs + content -->
        <div class="flex flex-1 flex-col overflow-hidden">
          <!-- Hero Zone -->
          @if (heroBlock()?.type === 'video') {
            <div class="aspect-video w-full shrink-0 bg-slate-900">
              <iframe
                [src]="getVideoUrl(heroBlock()?.content?.url)"
                title="Video"
                allow="autoplay; encrypted-media"
                allowfullscreen
                class="h-full w-full border-0"
              ></iframe>
            </div>
          } @else if (heroBlock()?.type === 'image') {
            <div class="relative w-full shrink-0">
              <img
                [src]="heroBlock()?.content?.url"
                [alt]="heroBlock()?.content?.alt || 'Imagen'"
                class="max-h-[400px] w-full object-cover"
              />
            </div>
          } @else {
            <div
              class="flex w-full shrink-0 items-center justify-center bg-gradient-to-br from-dark to-primary px-8 py-12"
            >
              <div class="text-center">
                @if (course()?.title) {
                  <p class="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
                    {{ course()?.title }}
                  </p>
                }
                <h2 class="text-2xl font-bold text-white sm:text-3xl">
                  {{ activeLessonTitle() || 'Selecciona una lección' }}
                </h2>
              </div>
            </div>
          }

          <!-- Header bar -->
          <header
            class="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3"
          >
            <a
              routerLink="/dashboard/instructor/courses"
              class="group flex items-center gap-2 text-muted transition-colors hover:text-dark"
            >
              <app-icon
                name="arrow_back"
                [size]="20"
                className="transition-transform group-hover:-translate-x-1"
              ></app-icon>
              <span class="text-sm font-medium"> Volver al editor </span>
            </a>

            <h1 class="max-w-md truncate text-base font-semibold text-dark">
              {{ activeLessonTitle() || 'Selecciona una lección' }}
            </h1>

            <div class="flex items-center gap-2">
              <app-status-badge [status]="course()?.status || ''"></app-status-badge>
            </div>
          </header>

          <!-- Tab bar -->
          <div class="shrink-0 border-b border-border bg-surface">
            <nav class="flex gap-1 overflow-x-auto px-6" role="tablist">
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === TAB_ID.CONTENT"
                (click)="setTab(TAB_ID.CONTENT)"
                class="flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors"
                [class.border-primary]="activeTab() === TAB_ID.CONTENT"
                [class.text-primary]="activeTab() === TAB_ID.CONTENT"
                [class.border-transparent]="activeTab() !== TAB_ID.CONTENT"
                [class.text-muted]="activeTab() !== TAB_ID.CONTENT"
              >
                <app-icon name="article" [size]="18"></app-icon>
                Contenido
              </button>
              @if (hasQuizzes()) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeTab() === TAB_ID.QUIZ"
                  (click)="setTab(TAB_ID.QUIZ)"
                  class="flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors"
                  [class.border-primary]="activeTab() === TAB_ID.QUIZ"
                  [class.text-primary]="activeTab() === TAB_ID.QUIZ"
                  [class.border-transparent]="activeTab() !== TAB_ID.QUIZ"
                  [class.text-muted]="activeTab() !== TAB_ID.QUIZ"
                >
                  <app-icon name="quiz" [size]="18"></app-icon>
                  Quiz
                </button>
              }
            </nav>
          </div>

          <!-- Tab content -->
          <main class="flex-1 overflow-y-auto bg-bg">
            <div class="mx-auto max-w-[800px] px-6 py-8 sm:px-10">
              @if (!activeLessonTitle()) {
                <div
                  class="flex items-center justify-center rounded-xl border border-border bg-surface p-12"
                >
                  <p class="text-sm text-muted">Selecciona una lección del panel izquierdo</p>
                </div>
              } @else if (activeTab() === TAB_ID.CONTENT) {
                <div class="mb-6">
                  <h2 class="text-2xl font-bold text-dark">
                    {{ activeLessonTitle() }}
                  </h2>
                </div>
                @if (contentBlocks().length > 0) {
                  <div class="space-y-6">
                    @for (block of contentBlocks(); track block.id) {
                      @switch (block.type) {
                        @case ('text') {
                          <div
                            class="prose prose-sm max-w-none"
                            [innerHTML]="sanitizeHtml(block.content?.html || '')"
                          ></div>
                        }
                        @case ('image') {
                          @if (block.content?.url) {
                            <img
                              [src]="block.content.url"
                              [alt]="block.content?.alt || 'Imagen'"
                              class="h-auto w-full rounded-md object-contain"
                            />
                          }
                        }
                        @case ('pdf') {
                          @if (block.content?.url) {
                            <div
                              class="flex items-center gap-3 rounded-md border border-border bg-surface p-4"
                            >
                              <app-icon
                                name="picture_as_pdf"
                                [size]="24"
                                className="text-error"
                              ></app-icon>
                              <span class="text-sm font-medium text-dark">{{
                                block.content?.fileName || 'Documento PDF'
                              }}</span>
                              <a
                                [href]="block.content.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="ml-auto text-sm text-primary hover:text-primary-hover"
                              >
                                Descargar
                              </a>
                            </div>
                          }
                        }
                        @case ('code') {
                          <pre
                            class="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
                          ><code>{{ block.content?.code || '' }}</code></pre>
                        }
                        @case ('embed') {
                          @if (block.content?.url) {
                            <div class="aspect-video overflow-hidden rounded-md shadow-subtle">
                              <iframe
                                [src]="block.content.url"
                                [title]="block.content?.title || 'Contenido embebido'"
                                allow="autoplay; encrypted-media"
                                allowfullscreen
                                class="h-full w-full border-0"
                              ></iframe>
                            </div>
                          }
                        }
                        @case ('audio') {
                          @if (block.content?.url) {
                            <div class="rounded-md border border-border bg-bg p-3">
                              <audio
                                [src]="block.content.url"
                                controls
                                class="w-full"
                                preload="metadata"
                              >
                                Tu navegador no soporta audio HTML5.
                              </audio>
                            </div>
                          }
                        }
                      }
                    }
                  </div>
                } @else {
                  <p class="py-8 text-center text-sm text-muted">
                    Esta lección no tiene contenido adicional.
                  </p>
                }
              } @else if (activeTab() === TAB_ID.QUIZ) {
                <div class="space-y-6">
                  <h2 class="text-lg font-semibold text-dark">Quizzes</h2>
                  @for (block of quizBlocks(); track block.id) {
                    <div class="space-y-4 rounded-lg bg-primary-light p-5">
                      <h4 class="text-sm font-semibold text-dark">Quiz</h4>
                      @for (q of block.content?.questions || []; track q.id; let idx = $index) {
                        <div>
                          <p class="text-sm font-medium text-dark">{{ idx + 1 }}. {{ q.text }}</p>
                          <div class="mt-2 space-y-1">
                            @for (opt of q.options; track opt.id) {
                              <label class="flex items-center gap-2 text-sm text-dark">
                                <input type="radio" [name]="'preview-' + q.id" class="h-4 w-4" />
                                {{ opt.text }}
                              </label>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
})
export class CoursePreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private coursesService = inject(CoursesService);
  private blocksService = inject(ContentBlocksApiService);

  course = signal<Course | null>(null);
  modules = signal<CourseModule[]>([]);
  activeModuleIndex = signal(0);
  activeLessonIndex = signal(0);
  activeTab = signal<TabId>(TAB_ID.CONTENT);
  loading = signal(true);
  expandedModule = signal(0);
  blocks = signal<ContentBlock[]>([]);

  readonly TAB_ID = TAB_ID;

  totalLessons = computed(() => this.modules().reduce((sum, m) => sum + m.lessons.length, 0));

  activeLessonTitle = computed(() => {
    const m = this.modules()[this.activeModuleIndex()];
    return m?.lessons[this.activeLessonIndex()]?.title || '';
  });

  activeLessonId = computed(() => {
    const m = this.modules()[this.activeModuleIndex()];
    return m?.lessons[this.activeLessonIndex()]?.id || '';
  });

  heroBlock = computed(() => {
    const blocks = this.blocks();
    return blocks.find((b) => b.type === 'video') || blocks.find((b) => b.type === 'image');
  });

  contentBlocks = computed(() => {
    const blocks = this.blocks();
    const hero = this.heroBlock();
    return blocks.filter(
      (b) =>
        b.type !== 'video' && b.type !== 'quiz' && !(b.id === hero?.id && hero?.type === 'image'),
    );
  });

  quizBlocks = computed(() => this.blocks().filter((b) => b.type === 'quiz'));

  hasQuizzes = computed(() => this.quizBlocks().length > 0);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id) {
      await this.loadData(id);
    }
  }

  async loadData(id: string) {
    try {
      const course = await firstValueFrom(this.coursesService.getCourseById(id));
      this.course.set(course);

      const curriculum = await firstValueFrom(this.coursesService.getCourseCurriculum(id));
      this.modules.set(curriculum.modules || []);

      if (curriculum.modules?.length) {
        this.expandedModule.set(0);
        await this.loadBlocks(curriculum.modules[0].lessons[0]?.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadBlocks(lessonId: string) {
    if (!lessonId) return;
    const blocks = await firstValueFrom(this.blocksService.list(lessonId));
    this.blocks.set(blocks);
  }

  toggleModule(mIdx: number) {
    this.expandedModule.set(this.expandedModule() === mIdx ? -1 : mIdx);
  }

  async selectLesson(mIdx: number, lIdx: number) {
    this.activeModuleIndex.set(mIdx);
    this.activeLessonIndex.set(lIdx);
    this.activeTab.set(TAB_ID.CONTENT);
    const m = this.modules()[mIdx];
    if (m?.lessons[lIdx]) {
      await this.loadBlocks(m.lessons[lIdx].id);
    }
  }

  setTab(tab: TabId) {
    this.activeTab.set(tab);
  }

  getVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    // Handle YouTube URLs
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    if (match) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${match[1]}`,
      );
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  sanitizeHtml(html: string): string {
    // Basic sanitization - in production use DOMPurify
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
