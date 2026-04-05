import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../../../../core/services/courses.service';
import { EnrollmentsService } from '../../../../../core/services/enrollments.service';
import { getMediaUrl } from '../../../../../shared/utils/media-url';

const PAGE_SIZE = 12;

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
  moduleCount?: number;
  lessonCount?: number;
}

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex h-full flex-col">
      <!-- Top Bar: Search + Filters -->
      <div class="sticky top-0 z-10 w-full border-b border-border bg-surface px-8 py-6 shadow-sm">
        <div class="mx-auto flex max-w-6xl flex-col gap-5">
          <!-- Header + Search -->
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <span class="material-symbols-outlined text-2xl text-primary">local_library</span>
              </div>
              <div>
                <h1 class="font-heading text-xl font-bold text-dark">Catalogo de Cursos</h1>
                <p class="text-sm text-muted">{{ totalItems() }} curso(s) disponible(s)</p>
              </div>
            </div>

            <div class="w-full sm:w-auto">
              <div class="group relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <span
                    class="material-symbols-outlined text-muted transition-colors group-focus-within:text-primary"
                    >search</span
                  >
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Buscar cursos..."
                  class="block w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-dark shadow-sm placeholder:text-muted transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 sm:w-80"
                />
              </div>
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              (click)="selectCategory(null)"
              [class]="
                !selectedCategoryId()
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-border bg-surface text-muted hover:border-primary/50 hover:text-primary'
              "
              class="shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
            >
              <span class="material-symbols-outlined text-base">apps</span>
              Todos
            </button>
            @for (category of categories(); track category.id) {
              <button
                type="button"
                (click)="selectCategory(category.id)"
                [class]="
                  selectedCategoryId() === category.id
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-surface text-muted hover:border-primary/50 hover:text-primary'
                "
                class="shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
              >
                {{ category.name }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Scrollable Course Grid -->
      <div class="flex-1 overflow-y-auto p-8">
        <div class="mx-auto max-w-6xl">
          @if (loading()) {
            <div
              class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-sm"
            >
              <div
                class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/40 border-t-primary"
              ></div>
              <p class="text-sm text-muted">Cargando cursos...</p>
            </div>
          }

          @if (error()) {
            <div class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <span class="material-symbols-outlined shrink-0 text-red-600">error</span>
              <p class="text-sm text-red-800">Error al cargar cursos: {{ error() }}</p>
            </div>
          }

          @if (!loading() && !error() && courses().length === 0) {
            <div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span class="material-symbols-outlined text-4xl text-primary">school</span>
              </div>
              <h3 class="font-heading text-lg font-semibold text-dark">
                No hay cursos disponibles
              </h3>
              <p class="max-w-md text-sm text-muted">
                {{
                  searchQuery || selectedCategoryId()
                    ? 'No se encontraron cursos con esos filtros.'
                    : 'Aun no hay cursos publicados.'
                }}
              </p>
            </div>
          }

          @if (!loading() && !error() && courses().length > 0) {
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (course of courses(); track course.id) {
                <div
                  class="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface transition-all hover:shadow-lg"
                >
                  <!-- Category Strip -->
                  <div [class]="'h-1.5 w-full ' + getCategoryColor(course.category?.name)"></div>

                  <div class="flex flex-1 flex-col p-5">
                    <!-- Category Label -->
                    @if (course.category) {
                      <div class="mb-2 flex items-start justify-between">
                        <span
                          [class]="
                            'text-xs font-semibold uppercase tracking-wider ' +
                            getCategoryTextColor(course.category?.name)
                          "
                        >
                          {{ course.category.name }}
                        </span>
                      </div>
                    }

                    <!-- Title -->
                    <h3
                      class="mb-2 line-clamp-2 text-lg font-semibold text-dark group-hover:text-primary"
                    >
                      {{ course.title }}
                    </h3>

                    <!-- Description -->
                    @if (course.description) {
                      <p class="mb-4 line-clamp-2 flex-1 text-sm text-muted">
                        {{ course.description }}
                      </p>
                    }

                    <!-- Instructor -->
                    @if (course.createdBy) {
                      <div class="mb-3 flex items-center gap-2">
                        <div
                          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
                        >
                          {{ course.createdBy.firstName.charAt(0)
                          }}{{ course.createdBy.lastName.charAt(0) }}
                        </div>
                        <span class="text-xs font-medium text-muted">
                          {{ course.createdBy.firstName }} {{ course.createdBy.lastName }}
                        </span>
                      </div>
                    }

                    <!-- Meta: Duration + Difficulty -->
                    <div class="mb-5 flex items-center gap-4 text-xs font-medium text-muted">
                      @if (course.estimatedDuration) {
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-base">schedule</span>
                          <span>{{ formatDuration(course.estimatedDuration) }}</span>
                        </div>
                      }
                      @if (course.difficultyLevel) {
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-base"
                            >signal_cellular_alt</span
                          >
                          <span class="capitalize">{{ course.difficultyLevel }}</span>
                        </div>
                      }
                    </div>

                    <!-- Action Button -->
                    <div class="mt-auto">
                      @if (enrolledCourseIds().has(course.id)) {
                        @if (enrollmentStatusMap().get(course.id) === 'completed') {
                          <a
                            [href]="'/dashboard/courses/' + course.id"
                            class="flex w-full items-center justify-center gap-2 rounded bg-alert px-4 py-2 text-sm font-bold text-dark shadow-sm transition-colors hover:bg-alert/80"
                          >
                            <span class="material-symbols-outlined text-base">emoji_events</span>
                            Completado
                          </a>
                        } @else {
                          <a
                            [href]="'/dashboard/courses/' + course.id"
                            class="flex w-full items-center justify-center gap-2 rounded border border-accent bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                          >
                            <span class="material-symbols-outlined text-base">play_circle</span>
                            En curso
                          </a>
                        }
                      } @else {
                        <button
                          type="button"
                          (click)="enrollInCourse(course.id)"
                          [disabled]="enrollingCourseId() === course.id"
                          class="w-full rounded border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                        >
                          {{
                            enrollingCourseId() === course.id ? 'Inscribiendo...' : 'Inscribirse'
                          }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div
                class="mt-8 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
              >
                <p class="text-sm text-muted">
                  Pagina <span class="font-medium text-dark">{{ currentPage() }}</span> de
                  <span class="font-medium text-dark">{{ totalPages() }}</span> ({{ totalItems() }}
                  cursos)
                </p>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() <= 1"
                    class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span class="material-symbols-outlined">chevron_left</span>
                    Anterior
                  </button>
                  <button
                    type="button"
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() >= totalPages()"
                    class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            }
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
export class CoursesListComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly enrollmentsService = inject(EnrollmentsService);

  readonly courses = signal<Course[]>([]);
  readonly categories = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalItems = signal(0);
  readonly totalPages = signal(1);
  readonly selectedCategoryId = signal<string | null>(null);
  readonly enrollingCourseId = signal<string | null>(null);
  readonly enrolledCourseIds = signal(new Set<string>());
  readonly enrollmentStatusMap = signal(new Map<string, string>());

  searchQuery = '';
  private searchTimeout: any;

  constructor() {
    // Load data on init
    this.loadCourses();
    this.loadCategories();
    this.loadEnrollments();
  }

  private loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      page: this.currentPage(),
      pageSize: PAGE_SIZE,
      status: 'published',
    };

    if (this.selectedCategoryId()) {
      params.categoryId = this.selectedCategoryId();
    }
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.coursesService.getCourses(params).subscribe({
      next: (result) => {
        this.courses.set(result?.items ?? result ?? []);
        this.totalItems.set(result?.totalItems ?? 0);
        this.totalPages.set(result?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.coursesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  private loadEnrollments(): void {
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (result) => {
        const items = result?.items ?? result ?? [];
        const enrolledIds = new Set((items as any[]).map((e: any) => e.courseId));
        const statusMap = new Map((items as any[]).map((e: any) => [e.courseId, e.status]));
        this.enrolledCourseIds.set(enrolledIds);
        this.enrollmentStatusMap.set(statusMap);
      },
      error: () => {},
    });
  }

  onSearchChange(value: string): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCourses();
    }, 300);
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.loadCourses();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCourses();
    }
  }

  enrollInCourse(courseId: string): void {
    this.enrollingCourseId.set(courseId);
    this.enrollmentsService.enrollInCourse(courseId).subscribe({
      next: () => {
        this.enrollingCourseId.set(null);
        this.loadEnrollments();
        // Could show toast here
      },
      error: () => {
        this.enrollingCourseId.set(null);
      },
    });
  }

  getCategoryColor(categoryName?: string): string {
    if (!categoryName) return 'bg-accent';
    const colors = [
      'bg-accent',
      'bg-red-500',
      'bg-purple-600',
      'bg-blue-600',
      'bg-orange-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] ?? 'bg-accent';
  }

  getCategoryTextColor(categoryName?: string): string {
    if (!categoryName) return 'text-accent';
    const colors = [
      'text-accent',
      'text-red-500',
      'text-purple-600',
      'text-blue-600',
      'text-orange-500',
      'text-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] ?? 'text-accent';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  }
}
