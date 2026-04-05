import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CoursesService } from '../../../../../core/services/courses.service';
import { EnrollmentsService } from '../../../../../core/services/enrollments.service';
import { CertificatesApiService } from '../../../../../core/services/certificates-api.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { getMediaUrl } from '../../../../../shared/utils/media-url';

interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  type?: string;
  estimatedDuration?: number;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  estimatedDuration?: number;
  difficultyLevel?: string;
  status: string;
  category?: { id: string; name: string };
  createdBy?: { firstName: string; lastName: string };
  tags?: { id: string; name: string }[];
  modules?: CourseModule[];
  ratings?: { average: number; count: number };
}

interface Enrollment {
  id: string;
  courseId: string;
  status: string;
  progressPercentage: number;
}

interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      @if (loading()) {
        <div class="space-y-6 animate-pulse">
          <div class="h-4 w-48 bg-border rounded"></div>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-8 space-y-6">
              <div class="h-48 bg-border rounded-lg"></div>
              <div class="h-96 bg-border rounded-lg"></div>
            </div>
            <div class="lg:col-span-4"><div class="h-80 bg-border rounded-lg"></div></div>
          </div>
        </div>
      }

      @if (error()) {
        <div class="rounded-md bg-error-light p-4">
          <p class="text-sm text-error-dark">{{ error() }}</p>
        </div>
      }

      @if (!loading() && !error() && course()) {
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm text-muted">
          <a routerLink="/dashboard/courses" class="transition-colors hover:text-primary"
            >Catálogo</a
          >
          @if (course()!.category) {
            <app-icon name="chevron_right" [size]="16"></app-icon>
            <a routerLink="/dashboard/courses" class="transition-colors hover:text-primary">{{
              course()!.category!.name
            }}</a>
            <app-icon name="chevron_right" [size]="16"></app-icon>
          }
          <span class="font-medium text-dark">{{ course()!.title }}</span>
        </nav>

        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <!-- Left Column -->
          <div class="space-y-8 lg:col-span-8">
            <div class="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              <!-- Hero -->
              <div class="relative h-48 overflow-hidden bg-gradient-to-r from-dark to-primary">
                @if (course()!.thumbnailUrl) {
                  <img
                    [src]="getMediaUrl(course()!.thumbnailUrl)"
                    [alt]="course()!.title"
                    class="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
                  />
                }
                <div
                  class="absolute inset-0 opacity-10"
                  style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"
                ></div>
                <div
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8"
                >
                  <div class="mb-2 flex items-center gap-2 flex-wrap">
                    @if (course()!.category) {
                      <span
                        class="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
                        >{{ course()!.category!.name }}</span
                      >
                    }
                    @if (course()!.difficultyLevel) {
                      <span
                        class="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
                        >{{ course()!.difficultyLevel }}</span
                      >
                    }
                  </div>
                  <h1 class="mb-2 text-3xl font-bold tracking-tight text-white">
                    {{ course()!.title }}
                  </h1>
                  @if (course()!.description) {
                    <p class="max-w-2xl text-sm text-white/90">{{ course()!.description }}</p>
                  }
                </div>
              </div>

              <!-- Content -->
              <div class="p-8">
                <div class="border-t border-border pt-8">
                  <h3 class="mb-6 text-lg font-bold text-dark">Contenido del curso</h3>
                  <div class="space-y-4">
                    @for (mod of course()!.modules || []; track mod.id) {
                      <div class="overflow-hidden rounded-md border border-border">
                        <button
                          type="button"
                          (click)="toggleModule(mod.id)"
                          class="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-bg/50"
                          [class.bg-bg]="isModuleExpanded(mod.id)"
                        >
                          <div class="flex items-center gap-3">
                            <app-icon
                              [name]="isModuleExpanded(mod.id) ? 'expand_more' : 'chevron_right'"
                              [size]="20"
                              className="text-muted"
                            ></app-icon>
                            <div>
                              <span class="block text-sm font-bold text-dark">{{ mod.title }}</span>
                              <span class="text-xs text-muted"
                                >{{ mod.lessons.length }}
                                {{ mod.lessons.length === 1 ? 'lección' : 'lecciones' }}</span
                              >
                            </div>
                          </div>
                        </button>

                        @if (isModuleExpanded(mod.id)) {
                          <div class="divide-y divide-border border-t border-border bg-surface">
                            @for (lesson of mod.lessons; track lesson.id) {
                              <a
                                [routerLink]="getLessonLink(lesson.id)"
                                class="flex items-center justify-between p-4 pl-12 transition-colors hover:bg-bg"
                              >
                                <div class="flex items-center gap-3">
                                  <app-icon
                                    [name]="getLessonIcon(lesson.id)"
                                    [size]="18"
                                    [className]="getLessonIconClass(lesson.id)"
                                  ></app-icon>
                                  <span class="text-sm font-medium text-dark">{{
                                    lesson.title
                                  }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                  @if (isLessonCompleted(lesson.id)) {
                                    <app-icon
                                      name="check_circle"
                                      [size]="16"
                                      className="text-primary"
                                    ></app-icon>
                                  }
                                  <span class="text-xs text-muted"
                                    >{{ lesson.estimatedDuration || 0 }}:00</span
                                  >
                                </div>
                              </a>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="sticky top-6 lg:col-span-4">
            <div class="space-y-6 rounded-lg border border-border bg-surface p-6 shadow-sm">
              <!-- Progress -->
              <div class="space-y-4">
                <div class="flex items-end justify-between">
                  <div class="flex flex-col">
                    <span class="mb-1 text-sm text-muted">Tu Progreso</span>
                    <span class="text-3xl font-bold text-dark">{{ progressPercentage() }}%</span>
                  </div>
                  @if (enrollment()) {
                    <span
                      class="rounded-full px-2 py-1 text-xs font-medium"
                      [class.bg-primary]="enrollment()!.status === 'active'"
                      [class.text-white]="enrollment()!.status === 'active'"
                      [class.bg-accent]="enrollment()!.status === 'completed'"
                      [class.text-dark]="enrollment()!.status === 'completed'"
                    >
                      {{
                        enrollment()!.status === 'active'
                          ? 'En Progreso'
                          : enrollment()!.status === 'completed'
                            ? 'Completado'
                            : enrollment()!.status
                      }}
                    </span>
                  }
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    class="h-2 rounded-full bg-primary"
                    [style.width.%]="progressPercentage()"
                  ></div>
                </div>

                @if (!enrollment()) {
                  <button
                    type="button"
                    (click)="enroll()"
                    [disabled]="enrolling()"
                    class="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    <span>{{ enrolling() ? 'Inscribiendo...' : 'Inscribirme' }}</span>
                    <app-icon name="arrow_forward" [size]="18" className="text-white"></app-icon>
                  </button>
                }

                @if (enrollment() && enrollment()!.status === 'active') {
                  <a
                    [routerLink]="getLessonLink(getFirstIncompleteLessonId())"
                    class="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
                  >
                    <span>Continuar Aprendiendo</span>
                    <app-icon name="arrow_forward" [size]="18" className="text-white"></app-icon>
                  </a>
                }

                @if (enrollment() && enrollment()!.status === 'completed') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between rounded-md bg-primary-light p-3">
                      <p class="text-sm font-medium text-primary">Curso completado</p>
                      <button
                        type="button"
                        (click)="downloadCertificate()"
                        [disabled]="downloading()"
                        class="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                      >
                        <app-icon name="download" [size]="16" className="text-white"></app-icon>
                        {{ downloading() ? 'Generando...' : 'Descargar Certificado' }}
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Details -->
              <div class="space-y-4 border-t border-border pt-6">
                <h4 class="text-xs font-bold uppercase tracking-wide text-muted">
                  Detalles del Curso
                </h4>
                @if (course()!.estimatedDuration) {
                  <div class="flex items-center gap-3">
                    <app-icon name="schedule" [size]="20" className="text-muted"></app-icon>
                    <div>
                      <p class="text-sm font-medium text-dark">
                        {{ course()!.estimatedDuration }} min
                      </p>
                      <p class="text-xs text-muted">Duración total</p>
                    </div>
                  </div>
                }
                @if (course()!.difficultyLevel) {
                  <div class="flex items-center gap-3">
                    <app-icon
                      name="signal_cellular_alt"
                      [size]="20"
                      className="text-muted"
                    ></app-icon>
                    <div>
                      <p class="text-sm font-medium text-dark capitalize">
                        {{ course()!.difficultyLevel }}
                      </p>
                      <p class="text-xs text-muted">Nivel de dificultad</p>
                    </div>
                  </div>
                }
                <div class="flex items-center gap-3">
                  <app-icon name="workspace_premium" [size]="20" className="text-muted"></app-icon>
                  <div>
                    <p class="text-sm font-medium text-dark">Certificado Incluido</p>
                    <p class="text-xs text-muted">Al completar 100%</p>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              @if (course()!.tags && course()!.tags!.length > 0) {
                <div class="border-t border-border pt-6">
                  <h4 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Etiquetas
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of course()!.tags; track tag.id) {
                      <span
                        class="rounded-md border border-border bg-bg px-2 py-1 text-xs font-medium text-muted"
                        >{{ tag.name }}</span
                      >
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <section class="mt-8">
          <h2 class="text-lg font-bold text-dark mb-4">Resenas del Curso</h2>
          <p class="text-sm text-muted">Las resenas se cargaran desde el backend.</p>
        </section>
      }
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
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  private readonly enrollmentsService = inject(EnrollmentsService);
  private readonly certificatesService = inject(CertificatesApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly enrolling = signal(false);
  readonly downloading = signal(false);
  readonly course = signal<Course | null>(null);
  readonly enrollment = signal<Enrollment | null>(null);
  readonly expandedModules = signal<Set<string>>(new Set());
  readonly lessonProgress = signal<LessonProgress[]>([]);
  readonly courseId = signal('');

  readonly progressPercentage = computed(() => this.enrollment()?.progressPercentage ?? 0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id) {
      void this.loadData(id);
    } else {
      this.loading.set(false);
      this.error.set('ID de curso no proporcionado');
    }
  }

  async loadData(id: string): Promise<void> {
    this.courseId.set(id);
    try {
      const course = await firstValueFrom(this.coursesService.getCourseById(id));
      this.course.set(course);
      const enrollments = await firstValueFrom(this.enrollmentsService.getMyEnrollmentsList());
      const enrollment = enrollments.find((e) => e.courseId === id);
      this.enrollment.set(enrollment ?? null);
      if (enrollment) {
        const progress = await firstValueFrom(this.enrollmentsService.getProgress(enrollment.id));
        this.lessonProgress.set(progress);
      }
    } catch (err: any) {
      this.error.set(err.message ?? 'Error al cargar el curso');
    } finally {
      this.loading.set(false);
    }
  }

  async enroll(): Promise<void> {
    const courseId = this.course()?.id;
    if (!courseId) return;
    this.enrolling.set(true);
    try {
      const enrollment = await firstValueFrom(this.enrollmentsService.enroll(courseId));
      this.enrollment.set(enrollment);
    } catch (err: any) {
      this.error.set(err.message ?? 'Error al inscribirse');
    } finally {
      this.enrolling.set(false);
    }
  }

  async downloadCertificate(): Promise<void> {
    const enrollmentId = this.enrollment()?.id;
    if (!enrollmentId) return;
    this.downloading.set(true);
    try {
      const blob = await firstValueFrom(this.certificatesService.download(enrollmentId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${this.course()?.title || 'curso'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      this.downloading.set(false);
    }
  }

  toggleModule(moduleId: string): void {
    this.expandedModules.update((s) => {
      const n = new Set(s);
      n.has(moduleId) ? n.delete(moduleId) : n.add(moduleId);
      return n;
    });
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules().has(moduleId);
  }
  isLessonCompleted(lessonId: string): boolean {
    return this.lessonProgress().some((p) => p.lessonId === lessonId && p.isCompleted);
  }
  getLessonIcon(lessonId: string): string {
    return this.isLessonCompleted(lessonId) ? 'check_circle' : 'play_circle';
  }
  getLessonIconClass(lessonId: string): string {
    return 'text-primary';
  }
  getLessonLink(lessonId: string): string {
    return '/dashboard/courses/' + this.course()?.id + '/lessons/' + lessonId;
  }
  getFirstIncompleteLessonId(): string {
    const course = this.course();
    if (!course?.modules) return '';
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!this.isLessonCompleted(lesson.id)) return lesson.id;
      }
    }
    return course.modules[0]?.lessons[0]?.id ?? '';
  }
  getMediaUrl(url: string | undefined): string {
    return getMediaUrl(url ?? '');
  }

  onReviewSubmitted() {
    // Reviews list component handles its own loading
  }
}
