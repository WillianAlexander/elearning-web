import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { CoursesService } from '../../../../../core/services/courses.service';
import { ModulesApiService } from '../../../../../core/services/modules-api.service';
import { LessonsApiService } from '../../../../../core/services/lessons-api.service';
import { ContentBlocksApiService } from '../../../../../core/services/content-blocks-api.service';

/* ─── Types ─── */
interface Module {
  id: string;
  title: string;
  order: number;
  prerequisiteModuleId?: string | null;
  lessons: Lesson[];
}
interface Lesson {
  id: string;
  title: string;
  type?: string;
  estimatedDuration?: number;
}
interface Block {
  id: string;
  type: string;
  content: any;
  order: number;
}

/* ─── Status helpers ─── */
const STATUS_CLASS: Record<string, string> = {
  draft: 'bg-muted/20 text-muted',
  pending_review: 'bg-alert-light text-alert-dark',
  published: 'bg-primary-light text-primary',
  archived: 'bg-bg text-muted',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador',
  pending_review: 'En Revision',
  published: 'Publicado',
  archived: 'Archivado',
};

const BLOCK_TYPES = [
  { type: 'text', icon: 'article', label: 'Texto' },
  { type: 'video', icon: 'videocam', label: 'Video' },
  { type: 'image', icon: 'image', label: 'Imagen' },
  { type: 'quiz', icon: 'quiz', label: 'Quiz' },
  { type: 'code', icon: 'code', label: 'Codigo' },
  { type: 'pdf', icon: 'picture_as_pdf', label: 'PDF' },
  { type: 'audio', icon: 'audio_file', label: 'Audio' },
  { type: 'embed', icon: 'open_in_new', label: 'Embed' },
];

const DEFAULT_CONTENT: Record<string, any> = {
  text: { html: '<p>Escribe aqui...</p>' },
  video: { url: '' },
  image: { url: '', alt: '' },
  quiz: { questions: [] },
  code: { code: '', language: 'javascript' },
  pdf: { url: '' },
  audio: { url: '' },
  embed: { url: '' },
};

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, FormsModule],
  template: `
    <!-- Loading -->
    @if (loading()) {
      <div class="flex h-full items-center justify-center">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
        ></div>
      </div>
    }
    <!-- Error -->
    @else if (error()) {
      <div class="p-6">
        <div class="rounded-md bg-error-light p-4">
          <p class="text-sm text-error-dark">{{ error() }}</p>
        </div>
      </div>
    }
    <!-- Editor -->
    @else {
      <div class="flex h-[calc(100vh-4rem)] flex-col">
        <!-- ═══ TOP BAR ═══ -->
        <div
          class="flex h-16 flex-none items-center justify-between border-b border-border bg-surface px-6"
        >
          <div class="flex flex-1 items-center gap-4">
            <a routerLink="/dashboard/instructor/courses" class="text-muted hover:text-primary"
              ><app-icon name="arrow_back" [size]="24"></app-icon
            ></a>
            <div class="mx-2 h-6 w-px bg-border"></div>
            <div class="flex flex-col">
              <div class="flex items-center gap-3">
                <h1 class="max-w-[400px] truncate text-lg font-bold text-dark">
                  {{ courseTitle() }}
                </h1>
                <span [class]="'rounded-full px-2 py-0.5 text-xs font-medium ' + statusClass()">{{
                  statusLabel()
                }}</span>
              </div>
              <span class="text-xs text-muted">{{
                dirty() ? 'Cambios sin guardar' : 'Guardado'
              }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <a
              [routerLink]="'/dashboard/instructor/courses/' + courseId() + '/preview'"
              class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-dark hover:bg-bg"
            >
              <app-icon name="visibility" [size]="20"></app-icon> Vista Previa
            </a>
            @if (courseStatus() === 'draft') {
              <button
                (click)="doRequestReview()"
                [disabled]="busy()"
                class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                <app-icon name="send" [size]="20" className="text-white"></app-icon> Enviar a
                Revision
              </button>
            }
          </div>
        </div>

        <!-- ═══ BODY ═══ -->
        <div class="flex flex-1 overflow-hidden">
          <!-- ─── SIDEBAR: MODULE TREE ─── -->
          <div class="w-80 flex-shrink-0 overflow-y-auto border-r border-border bg-bg">
            <div
              class="sticky top-0 z-10 border-b border-border bg-surface/50 p-4 backdrop-blur-sm"
            >
              <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                Estructura del Curso
              </h2>
              <button
                (click)="addModule()"
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <app-icon name="add_circle" [size]="18" className="text-primary"></app-icon> Añadir
                Modulo
              </button>
            </div>

            <div class="flex-1 space-y-4 overflow-y-auto p-3">
              @if (modules().length === 0) {
                <p class="py-4 text-center text-xs text-muted">
                  Sin modulos. Agrega uno para empezar.
                </p>
              }
              @for (mod of modules(); track mod.id; let mi = $index) {
                <div class="group">
                  <!-- Module header -->
                  <div class="mb-1 flex items-center gap-2 rounded-md px-2 py-2 hover:bg-surface">
                    <app-icon
                      [name]="expanded()[mod.id] ? 'folder_open' : 'folder'"
                      [size]="20"
                      className="text-muted"
                    ></app-icon>
                    <button
                      (click)="toggleModule(mod.id)"
                      class="flex-1 truncate text-left text-sm font-semibold text-dark"
                    >
                      {{ mod.title }}
                    </button>
                    <div
                      class="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <button (click)="openEditModule(mod)" class="rounded p-1 hover:bg-bg">
                        <app-icon name="edit" [size]="16" className="text-muted"></app-icon>
                      </button>
                      <button (click)="addLesson(mod.id)" class="rounded p-1 hover:bg-bg">
                        <app-icon name="add" [size]="16" className="text-muted"></app-icon>
                      </button>
                      <button
                        (click)="delModuleTarget.set(mod.id)"
                        class="rounded p-1 hover:bg-error-light"
                      >
                        <app-icon name="delete" [size]="16" className="text-muted"></app-icon>
                      </button>
                    </div>
                  </div>
                  <!-- Lessons -->
                  @if (expanded()[mod.id]) {
                    <div class="ml-5 space-y-1 border-l border-border pl-4">
                      @if (mod.lessons.length === 0) {
                        <p class="px-2 py-2 text-xs text-muted">Sin lecciones</p>
                      }
                      @for (les of mod.lessons; track les.id) {
                        <div
                          [class]="
                            'group/l relative flex items-center gap-3 rounded-md border p-2 transition-colors cursor-pointer ' +
                            (activeLessonId() === les.id
                              ? 'border-border bg-surface shadow-sm'
                              : 'border-transparent hover:border-border hover:bg-surface')
                          "
                          (click)="selectLesson(les.id, mod.id)"
                        >
                          @if (activeLessonId() === les.id) {
                            <div
                              class="absolute inset-y-0 left-0 w-1 rounded-l-md bg-primary"
                            ></div>
                          }
                          <app-icon
                            [name]="activeLessonId() === les.id ? 'description' : 'play_circle'"
                            [size]="20"
                            [className]="
                              activeLessonId() === les.id ? 'text-primary' : 'text-muted'
                            "
                          ></app-icon>
                          <div class="min-w-0 flex-1">
                            <p
                              [class]="
                                'truncate text-sm font-medium ' +
                                (activeLessonId() === les.id ? 'text-dark' : 'text-muted')
                              "
                            >
                              {{ les.title }}
                            </p>
                            <p class="truncate text-[10px] text-muted">
                              {{ les.type ?? 'Texto'
                              }}{{
                                les.estimatedDuration ? ' · ' + les.estimatedDuration + ' min' : ''
                              }}
                            </p>
                          </div>
                          <button
                            (click)="delLessonTarget.set(les.id); $event.stopPropagation()"
                            class="hidden rounded p-0.5 text-muted hover:text-error group-hover/l:block"
                          >
                            <app-icon name="close" [size]="16"></app-icon>
                          </button>
                        </div>
                      }
                      <button
                        (click)="addLesson(mod.id)"
                        class="mt-1 flex w-full items-center gap-1 rounded px-4 py-1.5 text-xs text-primary hover:bg-primary/5"
                      >
                        <app-icon name="add_circle" [size]="18" className="text-primary"></app-icon>
                        Agregar leccion
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- ─── MAIN EDITOR ─── -->
          <div class="flex-1 overflow-y-auto bg-surface">
            @if (activeLessonId()) {
              <div class="p-6">
                <h2 class="mb-4 text-lg font-bold text-dark">{{ activeLessonTitle() }}</h2>
                @if (blocks().length === 0) {
                  <div
                    class="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-center"
                  >
                    <app-icon name="edit_note" [size]="32" className="text-muted"></app-icon>
                    <p class="text-sm text-muted">Esta leccion aun no tiene contenido.</p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (blk of blocks(); track blk.id) {
                      <div
                        class="group relative rounded-lg border border-border p-4 hover:border-primary/30"
                      >
                        <button
                          (click)="removeBlock(blk.id)"
                          class="absolute -top-3 right-2 hidden rounded bg-error px-2 py-0.5 text-xs text-white hover:bg-error-hover group-hover:block"
                        >
                          Eliminar
                        </button>
                        <div class="mb-2 text-xs font-medium uppercase text-muted">
                          {{ blk.type }}
                        </div>
                        @switch (blk.type) {
                          @case ('text') {
                            <div
                              class="prose prose-sm max-w-none"
                              [innerHTML]="blk.content?.html ?? ''"
                            ></div>
                          }
                          @case ('video') {
                            <p class="text-sm text-muted">
                              Video: {{ blk.content?.url || 'Sin URL' }}
                            </p>
                          }
                          @case ('image') {
                            @if (blk.content?.url) {
                              <img [src]="blk.content.url" class="max-h-48 rounded" />
                            } @else {
                              <p class="text-sm text-muted">Sin imagen</p>
                            }
                          }
                          @case ('quiz') {
                            <p class="text-sm text-muted">
                              Quiz con {{ blk.content?.questions?.length ?? 0 }} preguntas
                            </p>
                          }
                          @case ('code') {
                            <pre
                              class="rounded bg-dark p-3 text-xs text-white"
                            ><code>{{ blk.content?.code ?? '' }}</code></pre>
                          }
                          @default {
                            <p class="text-sm text-muted">
                              {{ blk.type }}: {{ blk.content?.url || '' }}
                            </p>
                          }
                        }
                      </div>
                    }
                  </div>
                }
                <!-- Block toolbar -->
                <div class="mt-6 flex flex-wrap gap-2">
                  @for (bt of blockTypes; track bt.type) {
                    <button
                      (click)="addBlock(bt.type)"
                      class="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary"
                    >
                      <app-icon [name]="bt.icon" [size]="16"></app-icon> {{ bt.label }}
                    </button>
                  }
                </div>
              </div>
            } @else {
              <div class="flex h-full items-center justify-center">
                <p class="text-sm text-muted">
                  Selecciona una leccion del sidebar para editar su contenido
                </p>
              </div>
            }
          </div>
        </div>

        <!-- ═══ MODALS ═══ -->

        <!-- Edit module -->
        @if (editModuleId()) {
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            (click)="editModuleId.set(null)"
          >
            <div
              class="w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg"
              (click)="$event.stopPropagation()"
            >
              <h3 class="text-lg font-semibold text-dark">Editar Modulo</h3>
              <div class="mt-3">
                <label class="text-xs font-medium text-muted">Titulo</label>
                <input
                  type="text"
                  [(ngModel)]="editTitle"
                  name="editTitle"
                  class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  (keydown.enter)="saveModuleEdit()"
                  (keydown.escape)="editModuleId.set(null)"
                />
              </div>
              <div class="mt-3">
                <label class="text-xs font-medium text-muted">Prerequisito</label>
                @if (editPrereqs().length === 0) {
                  <p class="mt-1 text-xs text-muted/60">No hay modulos anteriores.</p>
                } @else {
                  <select
                    [(ngModel)]="editPrereq"
                    name="editPrereq"
                    class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none"
                  >
                    <option value="">Sin prerequisito</option>
                    @for (p of editPrereqs(); track p.id) {
                      <option [value]="p.id">{{ p.title }}</option>
                    }
                  </select>
                }
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button
                  (click)="editModuleId.set(null)"
                  class="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-bg"
                >
                  Cancelar
                </button>
                <button
                  (click)="saveModuleEdit()"
                  class="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Delete module -->
        @if (delModuleTarget()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-dark">Eliminar Modulo</h3>
              <p class="mt-2 text-sm text-muted">Se eliminaran todas las lecciones. ¿Seguro?</p>
              <div class="mt-4 flex justify-end gap-2">
                <button
                  (click)="delModuleTarget.set(null)"
                  class="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-bg"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmDelModule()"
                  class="rounded-md bg-error px-3 py-1.5 text-sm text-white hover:bg-error-hover"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Delete lesson -->
        @if (delLessonTarget()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-dark">Eliminar Leccion</h3>
              <p class="mt-2 text-sm text-muted">Se eliminara todo el contenido. ¿Seguro?</p>
              <div class="mt-4 flex justify-end gap-2">
                <button
                  (click)="delLessonTarget.set(null)"
                  class="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-bg"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmDelLesson()"
                  class="rounded-md bg-error px-3 py-1.5 text-sm text-white hover:bg-error-hover"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class CourseEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CoursesService);
  private modsSvc = inject(ModulesApiService);
  private lessSvc = inject(LessonsApiService);
  private blksSvc = inject(ContentBlocksApiService);

  /* ── Signals (ALL state is signals — Angular tracks them automatically) ── */
  readonly courseId = signal('');
  readonly courseTitle = signal('');
  readonly courseStatus = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);
  readonly dirty = signal(false);

  readonly modules = signal<Module[]>([]);
  readonly expanded = signal<Record<string, boolean>>({});
  readonly activeModuleId = signal<string | null>(null);
  readonly activeLessonId = signal<string | null>(null);
  readonly blocks = signal<Block[]>([]);

  readonly editModuleId = signal<string | null>(null);
  editTitle = '';
  editPrereq = '';

  readonly delModuleTarget = signal<string | null>(null);
  readonly delLessonTarget = signal<string | null>(null);

  readonly blockTypes = BLOCK_TYPES;

  /* ── Computed ── */
  readonly statusClass = computed(
    () => STATUS_CLASS[this.courseStatus()] ?? 'bg-muted/20 text-muted',
  );
  readonly statusLabel = computed(() => STATUS_LABEL[this.courseStatus()] ?? this.courseStatus());

  readonly activeLessonTitle = computed(() => {
    const lid = this.activeLessonId();
    if (!lid) return '';
    for (const m of this.modules()) for (const l of m.lessons) if (l.id === lid) return l.title;
    return '';
  });

  readonly editPrereqs = computed(() => {
    const eid = this.editModuleId();
    if (!eid) return [];
    const mods = this.modules();
    const idx = mods.findIndex((m) => m.id === eid);
    return mods.filter((m, i) => m.id !== eid && i < idx);
  });

  /* ── Lifecycle ── */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.courseId.set(id);
    if (id) this.load(id);
  }

  ngOnDestroy() {
    this.activeModuleId.set(null);
    this.activeLessonId.set(null);
  }

  /* ── Data loading ── */
  private load(id: string) {
    this.loading.set(true);
    this.courses.getCourseById(id).subscribe({
      next: (c: any) => {
        this.courseTitle.set(c?.title ?? '');
        this.courseStatus.set(c?.status ?? 'draft');
        this.courses.getCourseCurriculum(id).subscribe({
          next: (data: any) => {
            const mods: Module[] = (data?.modules ?? (Array.isArray(data) ? data : [])).map(
              (m: any) => ({
                ...m,
                lessons: m.lessons ?? [],
              }),
            );
            this.modules.set(mods);
            // Expand all
            const exp: Record<string, boolean> = {};
            mods.forEach((m) => (exp[m.id] = true));
            this.expanded.set(exp);
            // Select first lesson
            if (mods.length > 0) {
              this.activeModuleId.set(mods[0].id);
              if (mods[0].lessons.length > 0) this.selectLesson(mods[0].lessons[0].id, mods[0].id);
            }
            this.loading.set(false);
          },
          error: () => {
            this.modules.set([]);
            this.loading.set(false);
          },
        });
      },
      error: (e: any) => {
        this.error.set(e?.message ?? 'Error');
        this.loading.set(false);
      },
    });
  }

  /* ── Module tree actions ── */
  toggleModule(id: string) {
    this.expanded.update((e) => ({ ...e, [id]: !e[id] }));
  }

  selectLesson(lessonId: string, moduleId: string) {
    this.activeModuleId.set(moduleId);
    this.activeLessonId.set(lessonId);
    this.blksSvc.list(lessonId).subscribe({
      next: (b: any) => this.blocks.set(Array.isArray(b) ? b : []),
      error: () => this.blocks.set([]),
    });
  }

  addModule() {
    const len = this.modules().length;
    this.modsSvc
      .create(this.courseId(), { title: `Modulo ${len + 1}`, orderIndex: len })
      .subscribe({
        next: (m: any) => {
          const created: Module = { ...m, lessons: m.lessons ?? [] };
          this.modules.update((ms) => [...ms, created]);
          this.expanded.update((e) => ({ ...e, [created.id]: true }));
        },
      });
  }

  addLesson(moduleId: string) {
    const mod = this.modules().find((m) => m.id === moduleId);
    const count = mod?.lessons.length ?? 0;
    this.lessSvc
      .create(this.courseId(), moduleId, { title: `Leccion ${count + 1}`, orderIndex: count })
      .subscribe({
        next: (l: any) => {
          this.modules.update((ms) =>
            ms.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, l] } : m)),
          );
          this.expanded.update((e) => ({ ...e, [moduleId]: true }));
          this.selectLesson(l.id, moduleId);
        },
      });
  }

  openEditModule(mod: Module) {
    this.editModuleId.set(mod.id);
    this.editTitle = mod.title;
    this.editPrereq = mod.prerequisiteModuleId ?? '';
  }

  saveModuleEdit() {
    const id = this.editModuleId();
    if (!id || !this.editTitle.trim()) return;
    const title = this.editTitle.trim();
    const prereq = this.editPrereq || null;
    this.modsSvc.update(this.courseId(), id, { title, prerequisiteModuleId: prereq }).subscribe({
      next: () => {
        this.modules.update((ms) =>
          ms.map((m) => (m.id === id ? { ...m, title, prerequisiteModuleId: prereq } : m)),
        );
        this.editModuleId.set(null);
      },
    });
  }

  confirmDelModule() {
    const id = this.delModuleTarget();
    if (!id) return;
    this.modsSvc.delete(this.courseId(), id).subscribe({
      next: () => {
        this.modules.update((ms) => ms.filter((m) => m.id !== id));
        if (this.activeModuleId() === id) {
          this.activeModuleId.set(null);
          this.activeLessonId.set(null);
          this.blocks.set([]);
        }
        this.delModuleTarget.set(null);
      },
    });
  }

  confirmDelLesson() {
    const id = this.delLessonTarget();
    if (!id) return;
    let mid = '';
    for (const m of this.modules())
      if (m.lessons.some((l) => l.id === id)) {
        mid = m.id;
        break;
      }
    if (!mid) {
      this.delLessonTarget.set(null);
      return;
    }
    this.lessSvc.delete(this.courseId(), mid, id).subscribe({
      next: () => {
        this.modules.update((ms) =>
          ms.map((m) =>
            m.id === mid ? { ...m, lessons: m.lessons.filter((l) => l.id !== id) } : m,
          ),
        );
        if (this.activeLessonId() === id) {
          this.activeLessonId.set(null);
          this.blocks.set([]);
        }
        this.delLessonTarget.set(null);
      },
    });
  }

  /* ── Block actions ── */
  addBlock(type: string) {
    const lid = this.activeLessonId();
    if (!lid) return;
    this.blksSvc.create(lid, { type, content: DEFAULT_CONTENT[type] ?? {} }).subscribe({
      next: (b: any) => {
        this.blocks.update((bs) => [...bs, b]);
        this.dirty.set(true);
      },
    });
  }

  removeBlock(blockId: string) {
    const lid = this.activeLessonId();
    if (!lid) return;
    this.blksSvc.delete(lid, blockId).subscribe({
      next: () => {
        this.blocks.update((bs) => bs.filter((b) => b.id !== blockId));
        this.dirty.set(true);
      },
    });
  }

  /* ── Course actions ── */
  doRequestReview() {
    this.busy.set(true);
    this.courses.requestReview(this.courseId()).subscribe({
      next: () => {
        this.courseStatus.set('pending_review');
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }
}
