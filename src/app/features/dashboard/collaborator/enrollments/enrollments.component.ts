import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EnrollmentsService } from '../../../../core/services/enrollments.service';
import { CertificatesApiService } from '../../../../core/services/certificates-api.service';
import { getMediaUrl } from '../../../../shared/utils/media-url';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [StatCardComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <span class="material-symbols-outlined text-2xl text-primary">school</span>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Mis Inscripciones</h1>
            <p class="text-sm text-muted">Cursos en los que estas inscrito</p>
          </div>
        </div>
        <a
          href="/dashboard/courses"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <span class="material-symbols-outlined">local_library</span>
          Explorar cursos
        </a>
      </div>

      <!-- Stats -->
      @if (!loading() && !error() && stats().total > 0) {
        <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <app-stat-card label="Total" [value]="stats().total" icon="school" color="primary" />
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
        </div>
      }

      <!-- Filters -->
      <div class="mt-6 flex items-center gap-2">
        @for (filter of statusFilters; track filter.value) {
          <button
            type="button"
            (click)="setStatusFilter(filter.value)"
            [class]="
              statusFilter() === filter.value
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-border bg-surface text-muted hover:border-primary/50 hover:text-primary'
            "
            class="shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
          >
            {{ filter.label }}
          </button>
        }
      </div>

      <!-- Content -->
      <div class="mt-6">
        @if (loading()) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-sm"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/40 border-t-primary"
            ></div>
            <p class="text-sm text-muted">Cargando inscripciones...</p>
          </div>
        }

        @if (error()) {
          <div class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <span class="material-symbols-outlined shrink-0 text-red-600">error</span>
            <p class="text-sm text-red-800">Error al cargar inscripciones: {{ error() }}</p>
          </div>
        }

        @if (!loading() && !error() && filtered().length === 0) {
          <div
            class="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface py-16 shadow-sm"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span class="material-symbols-outlined text-4xl text-primary">school</span>
            </div>
            <div class="text-center">
              <h3 class="font-heading text-lg font-semibold text-dark">No hay inscripciones</h3>
              <p class="mt-1 max-w-md text-sm text-muted">
                {{
                  statusFilter() !== 'all'
                    ? 'No hay inscripciones con ese filtro.'
                    : 'Aun no estas inscrito en ningun curso.'
                }}
              </p>
            </div>
            @if (statusFilter() === 'all') {
              <a
                href="/dashboard/courses"
                class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <span class="material-symbols-outlined">local_library</span>
                Explorar cursos
              </a>
            }
          </div>
        }

        @if (!loading() && !error() && filtered().length > 0) {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (enrollment of filtered(); track enrollment.id) {
              <a
                [href]="'/dashboard/courses/' + enrollment.courseId"
                class="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md"
              >
                <!-- Thumbnail -->
                <div class="relative aspect-video w-full overflow-hidden bg-bg">
                  @if (enrollment.course?.thumbnailUrl) {
                    <img
                      [src]="getMediaUrl(enrollment.course.thumbnailUrl)"
                      [alt]="enrollment.course?.title"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      [class.brightness-90]="enrollment.status === 'completed'"
                    />
                  } @else {
                    <div class="flex h-full flex-col items-center justify-center gap-1 text-muted">
                      <span class="material-symbols-outlined text-4xl text-primary/40">school</span>
                      <span class="text-xs">Sin imagen</span>
                    </div>
                  }

                  <!-- Completed overlay -->
                  @if (enrollment.status === 'completed') {
                    <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div
                        class="flex items-center gap-2 rounded-full bg-alert px-4 py-2 text-sm font-bold text-dark shadow-lg"
                      >
                        <span class="material-symbols-outlined">emoji_events</span>
                        Completado
                      </div>
                    </div>
                  }

                  <!-- Status badge -->
                  <div class="absolute left-3 top-3">
                    <span [class]="getStatusBadgeClass(enrollment.status)">
                      {{ getStatusLabel(enrollment.status) }}
                    </span>
                  </div>

                  <!-- Progress bar at bottom -->
                  <div class="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                    <div
                      [class]="enrollment.status === 'completed' ? 'bg-alert' : 'bg-accent'"
                      class="h-full transition-all"
                      [style.width.%]="enrollment.progressPercentage"
                    ></div>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex flex-1 flex-col p-4">
                  <h3
                    class="truncate font-heading text-sm font-semibold group-hover:text-primary"
                    [class.text-alert-dark]="enrollment.status === 'completed'"
                  >
                    {{ enrollment.course?.title }}
                  </h3>

                  @if (enrollment.course?.description) {
                    <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {{ enrollment.course?.description }}
                    </p>
                  }

                  <!-- Progress info -->
                  <div class="mt-3 flex items-center gap-3">
                    @if (enrollment.status === 'completed') {
                      <div class="flex flex-1 items-center gap-2 text-sm font-bold text-alert-dark">
                        <span class="material-symbols-outlined">emoji_events</span>
                        100% completado
                      </div>
                    } @else {
                      <div class="flex-1 rounded-full bg-black/10 h-2">
                        <div
                          class="h-full rounded-full bg-accent transition-all"
                          [style.width.%]="enrollment.progressPercentage"
                        ></div>
                      </div>
                      <span class="shrink-0 text-sm font-bold text-primary"
                        >{{ enrollment.progressPercentage }}%</span
                      >
                    }
                  </div>

                  <!-- Metadata -->
                  <div class="mt-2.5 flex items-center justify-between text-xs text-muted">
                    <span class="flex items-center gap-1">
                      <span
                        class="material-symbols-outlined text-base"
                        [class.text-primary]="enrollment.status === 'completed'"
                        [class.text-accent]="enrollment.status !== 'completed'"
                        >check_circle</span
                      >
                      {{ enrollment.completedLessons }}/{{ enrollment.totalLessons }} lecciones
                    </span>
                    @if (enrollment.lastAccessedAt) {
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        {{ formatDate(enrollment.lastAccessedAt) }}
                      </span>
                    }
                  </div>

                  <!-- Certificate button -->
                  @if (enrollment.status === 'completed') {
                    <button
                      type="button"
                      (click)="
                        $event.preventDefault();
                        $event.stopPropagation();
                        downloadCertificate(enrollment.id)
                      "
                      class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-alert px-3 py-2.5 text-xs font-bold text-dark shadow-sm transition-colors hover:bg-alert/80"
                    >
                      <span class="material-symbols-outlined">workspace_premium</span>
                      Descargar Certificado
                    </button>
                  }
                </div>
              </a>
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
export class EnrollmentsComponent {
  private readonly enrollmentsService = inject(EnrollmentsService);
  private readonly certificatesService = inject(CertificatesApiService);

  readonly enrollments = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<'all' | 'active' | 'completed' | 'dropped'>('all');

  readonly statusFilters = [
    { label: 'Todos', value: 'all' as const },
    { label: 'En Progreso', value: 'active' as const },
    { label: 'Completados', value: 'completed' as const },
    { label: 'Abandonados', value: 'dropped' as const },
  ];

  readonly filtered = computed(() => {
    const filter = this.statusFilter();
    const list = this.enrollments();
    if (filter === 'all') return list;
    return list.filter((e) => e.status === filter);
  });

  readonly stats = computed(() => {
    const list = this.enrollments();
    if (list.length === 0) return { total: 0, active: 0, completed: 0, avgProgress: 0 };
    const active = list.filter((e) => e.status === 'active').length;
    const completed = list.filter((e) => e.status === 'completed').length;
    const avgProgress = Math.round(
      list.reduce((sum, e) => sum + e.progressPercentage, 0) / list.length,
    );
    return { total: list.length, active, completed, avgProgress };
  });

  constructor() {
    this.loadEnrollments();
  }

  private loadEnrollments(): void {
    this.loading.set(true);
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (result) => {
        this.enrollments.set(result?.items ?? result ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  setStatusFilter(status: 'all' | 'active' | 'completed' | 'dropped'): void {
    this.statusFilter.set(status);
  }

  getMediaUrl(url: string): string {
    return getMediaUrl(url);
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      active:
        'inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary',
      completed:
        'inline-flex items-center rounded-full bg-alert/10 px-2.5 py-0.5 text-xs font-medium text-alert-dark',
      dropped:
        'inline-flex items-center rounded-full bg-muted/20 px-2.5 py-0.5 text-xs font-medium text-muted',
      expired:
        'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'En Progreso',
      completed: 'Completado',
      dropped: 'Abandonado',
      expired: 'Expirado',
    };
    return map[status] ?? status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
    });
  }

  downloadCertificate(enrollmentId: string): void {
    this.certificatesService.download(enrollmentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: (err) => console.error(err),
    });
  }
}
