import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { CoursesService } from '../../../core/services/courses.service';
import { getMediaUrl } from '../../../shared/utils/media-url';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, StatCardComponent],
  template: `
    <div class="mx-auto flex max-w-5xl flex-col gap-8">
      <!-- Welcome Header -->
      <header
        class="flex items-center gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
      >
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
        >
          {{ initials() }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="font-heading text-2xl font-bold text-dark">
            {{ greeting() }}, {{ authStore.user()?.firstName ?? 'usuario' }}
          </h1>
          <p class="mt-0.5 text-sm text-muted">{{ formattedDate() }}</p>
        </div>

        @if (authStore.isColaborador()) {
          <a
            [routerLink]="'/dashboard/courses'"
            class="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            <span class="material-symbols-outlined text-lg">local_library</span>
            Explorar cursos
          </a>
        }

        @if (authStore.isInstructor() || authStore.isAdmin()) {
          <a
            [routerLink]="'/dashboard/instructor/courses'"
            class="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            <span class="material-symbols-outlined text-lg">school</span>
            Mis Cursos
          </a>
        }
      </header>

      <!-- Admin Dashboard -->
      @if (authStore.isAdmin()) {
        <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <app-stat-card
            label="Cursos Publicados"
            [value]="publishedCount()"
            icon="check_circle"
            color="primary"
          />
          <app-stat-card
            label="Pendientes Revisión"
            [value]="pendingCount()"
            icon="pending"
            color="alert"
          />
          <app-stat-card
            label="Total Cursos"
            [value]="totalCourses()"
            icon="school"
            color="primary"
          />
          <app-stat-card
            label="Estudiantes Activos"
            [value]="totalStudents()"
            icon="group"
            color="primary"
          />
        </section>
      }

      <!-- Instructor Dashboard (only for actual instructors, not admins) -->
      @if (authStore.userRole() === 'instructor') {
        <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <app-stat-card
            label="Mis Cursos"
            [value]="instructorCourses().length"
            icon="school"
            color="primary"
          />
          <app-stat-card
            label="Borradores"
            [value]="draftCount()"
            icon="edit_note"
            color="accent"
          />
          <app-stat-card
            label="En Revisión"
            [value]="pendingCount()"
            icon="pending"
            color="alert"
          />
          <app-stat-card
            label="Publicados"
            [value]="publishedCount()"
            icon="check_circle"
            color="primary"
          />
        </section>

        @if (instructorCourses().length === 0) {
          <section
            class="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface py-16 shadow-sm"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span class="material-symbols-outlined text-4xl text-primary">school</span>
            </div>
            <div class="text-center">
              <h2 class="font-heading text-lg font-semibold text-dark">Crea tu primer curso</h2>
              <p class="mt-1 max-w-md text-sm text-muted">
                Comenza a compartir tu conocimiento con los colaboradores de la cooperativa.
              </p>
            </div>
            <a
              [routerLink]="'/dashboard/instructor/courses/new'"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <span class="material-symbols-outlined">add</span>
              Crear Curso
            </a>
          </section>
        }

        @if (instructorCourses().length > 0) {
          <section>
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">school</span>
                <h2 class="font-heading text-lg font-semibold text-dark">Mis Cursos</h2>
              </div>
              <a
                [routerLink]="'/dashboard/instructor/courses'"
                class="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Ver todos
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              </a>
            </div>
            <div class="flex flex-col gap-3">
              @for (course of instructorCourses().slice(0, 5); track course.id) {
                <a
                  [routerLink]="'/dashboard/instructor/courses/' + course.id + '/edit'"
                  class="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg">
                    @if (course.thumbnailUrl) {
                      <img
                        [src]="resolveUrl(course.thumbnailUrl)"
                        [alt]="course.title"
                        class="h-full w-full object-cover"
                      />
                    } @else {
                      <div class="flex h-full items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-primary/40"
                          >school</span
                        >
                      </div>
                    }
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-semibold text-dark group-hover:text-primary">
                      {{ course.title }}
                    </h3>
                    <div class="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span [class]="getStatusClasses(course.status)">
                        <span class="material-symbols-outlined text-xs">{{
                          getStatusIcon(course.status)
                        }}</span>
                        {{ getStatusLabel(course.status) }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      }

      <!-- Student/Collaborator Dashboard -->
      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <app-stat-card
          label="Total Inscripciones"
          [value]="stats().total"
          icon="school"
          color="primary"
        />
        <app-stat-card
          label="En Progreso"
          [value]="stats().active"
          icon="play_circle"
          color="accent"
        />
        <app-stat-card
          label="Completados"
          [value]="stats().completed"
          icon="workspace_premium"
          color="alert"
        />
        <app-stat-card
          label="Progreso Promedio"
          [value]="stats().avgProgress + '%'"
          icon="trending_up"
          color="primary"
        />
      </section>

      <!-- Continue Learning -->
      @if (activeEnrollments().length > 0) {
        <section>
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">play_circle</span>
              <h2 class="font-heading text-lg font-semibold text-dark">Continuar Aprendiendo</h2>
            </div>
            <a
              [routerLink]="'/dashboard/courses'"
              class="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver catalogo
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
          </div>
          <div class="flex flex-col gap-3">
            @for (enrollment of activeEnrollments().slice(0, 4); track enrollment.id) {
              <a
                [routerLink]="'/dashboard/courses/' + enrollment.courseId"
                class="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg">
                  @if (enrollment.course?.thumbnailUrl) {
                    <img
                      [src]="resolveUrl(enrollment.course.thumbnailUrl)"
                      [alt]="enrollment.course?.title"
                      class="h-full w-full object-cover"
                    />
                  } @else {
                    <div class="flex h-full items-center justify-center">
                      <span class="material-symbols-outlined text-2xl text-primary/40">school</span>
                    </div>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-semibold text-dark group-hover:text-primary">
                    {{ enrollment.course?.title }}
                  </h3>
                  <div class="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs text-accent"
                        >check_circle</span
                      >
                      {{ enrollment.completedLessons }}/{{ enrollment.totalLessons }} lecciones
                    </span>
                  </div>
                  <div class="mt-2 h-1.5 w-full rounded-full bg-black/10">
                    <div
                      class="h-full rounded-full bg-accent transition-all"
                      [style.width.%]="enrollment.progressPercentage"
                    ></div>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <div class="hidden flex-col items-center sm:flex">
                    <span class="text-lg font-bold text-primary"
                      >{{ enrollment.progressPercentage }}%</span
                    >
                  </div>
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                  >
                    <span class="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                </div>
              </a>
            }
          </div>
        </section>
      }

      <!-- Empty State -->
      @if (authStore.isColaborador() && enrollments().length === 0) {
        <section
          class="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface py-16 shadow-sm"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span class="material-symbols-outlined text-4xl text-primary">school</span>
          </div>
          <div class="text-center">
            <h2 class="font-heading text-lg font-semibold text-dark">Bienvenido al Aula Virtual</h2>
            <p class="mt-1 max-w-md text-sm text-muted">
              Aun no estas inscrito en ningun curso. Explora el catalogo y comenza tu capacitacion.
            </p>
          </div>
          <a
            [routerLink]="'/dashboard/courses'"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span class="material-symbols-outlined">local_library</span>
            Explorar cursos
          </a>
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
export class HomeComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  private readonly enrollmentsService = inject(EnrollmentsService);
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly enrollments = signal<any[]>([]);
  readonly instructorCourses = signal<any[]>([]);
  readonly loading = signal(true);

  readonly initials = computed(() => {
    const user = this.authStore.user();
    if (!user) return '??';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly formattedDate = computed(() => {
    const dateStr = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  });

  readonly activeEnrollments = computed(() =>
    (this.enrollments() ?? []).filter((e) => e.status === 'active'),
  );

  readonly stats = computed(() => {
    const list = this.enrollments() ?? [];
    if (!list.length) return { total: 0, active: 0, completed: 0, avgProgress: 0 };
    const active = list.filter((e) => e.status === 'active').length;
    const completed = list.filter((e) => e.status === 'completed').length;
    const avgProgress = Math.round(
      list.reduce((sum, e) => sum + e.progressPercentage, 0) / list.length,
    );
    return { total: list.length, active, completed, avgProgress };
  });

  // Admin/Instructor stats
  readonly totalCourses = signal(0);
  readonly publishedCount = signal(0);
  readonly pendingCount = signal(0);
  readonly draftCount = signal(0);
  readonly totalStudents = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (result) => {
        this.enrollments.set(result?.items ?? result ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.enrollments.set([]);
        this.loading.set(false);
      },
    });

    // Load instructor courses if applicable
    if (this.authStore.isInstructor() || this.authStore.isAdmin()) {
      const userId = this.authStore.user()?.id;
      if (userId) {
        this.coursesService.getCourses({ createdById: userId, pageSize: 100 } as any).subscribe({
          next: (result) => {
            const items = result?.items ?? result ?? [];
            this.instructorCourses.set(items);
            this.totalCourses.set(result?.totalItems ?? items.length);
            this.publishedCount.set(items.filter((c: any) => c.status === 'published').length);
            this.pendingCount.set(items.filter((c: any) => c.status === 'pending_review').length);
            this.draftCount.set(items.filter((c: any) => c.status === 'draft').length);
          },
          error: () => {},
        });
      }
    }
  }

  resolveUrl(url: string): string {
    return getMediaUrl(url);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Borrador',
      pending_review: 'En Revision',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return map[status] ?? status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      draft: 'edit_note',
      pending_review: 'pending',
      published: 'check_circle',
      archived: 'inventory_2',
    };
    return map[status] ?? 'help';
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      draft:
        'inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted',
      pending_review:
        'inline-flex items-center gap-1 rounded-full bg-alert/10 px-2 py-0.5 text-xs font-medium text-alert-dark',
      published:
        'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary',
      archived:
        'inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted',
    };
    return map[status] ?? 'bg-bg text-muted';
  }
}
