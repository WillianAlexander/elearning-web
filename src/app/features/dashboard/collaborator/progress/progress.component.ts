import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EnrollmentsService } from '../../../../core/services/enrollments.service';
import { CertificatesApiService } from '../../../../core/services/certificates-api.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { getMediaUrl } from '../../../../shared/utils/media-url';

interface EnrollmentWithCourse {
  id: string;
  courseId: string;
  status: string;
  progressPercentage: number;
  course?: { id: string; title: string; thumbnailUrl?: string; description?: string };
  completedLessons?: number;
  totalLessons?: number;
  completedAt?: string;
  lastAccessedAt?: string;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="p-6 sm:p-8">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <app-icon name="trending_up" [size]="24" className="text-primary"></app-icon>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Mi Progreso</h1>
            <p class="text-sm text-muted">Tu avance en los cursos inscritos</p>
          </div>
        </div>
        <a
          routerLink="/dashboard/courses"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
        >
          <app-icon name="local_library" [size]="18"></app-icon> Explorar cursos
        </a>
      </div>
      @if (!loading() && totalEnrollments() > 0) {
        <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-surface p-5">
            <p class="mb-1 text-xs font-semibold uppercase text-muted">Total</p>
            <p class="text-3xl font-bold text-dark">{{ totalEnrollments() }}</p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5">
            <p class="mb-1 text-xs font-semibold uppercase text-muted">En Progreso</p>
            <p class="text-3xl font-bold text-primary">{{ activeCount() }}</p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5">
            <p class="mb-1 text-xs font-semibold uppercase text-muted">Completados</p>
            <p class="text-3xl font-bold text-accent">{{ completedCount() }}</p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5">
            <p class="mb-1 text-xs font-semibold uppercase text-muted">Promedio</p>
            <p class="text-3xl font-bold text-dark">{{ avgProgress() }}%</p>
          </div>
        </div>
      }
      <div class="mb-6 flex gap-2 border-b border-border">
        @for (filter of filters; track filter.value) {
          <button
            type="button"
            (click)="activeFilter.set(filter.value)"
            class="pb-3 px-4 text-sm font-medium"
            [class.border-b-2]="activeFilter() === filter.value"
            [class.border-primary]="activeFilter() === filter.value"
            [class.text-primary]="activeFilter() === filter.value"
            [class.text-muted]="activeFilter() !== filter.value"
          >
            {{ filter.label }} ({{ filter.count() }})
          </button>
        }
      </div>
      @if (loading()) {
        <div
          class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16"
        >
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          ></div>
          <p class="text-sm text-muted">Cargando...</p>
        </div>
      } @else if (filteredEnrollments().length === 0) {
        <div
          class="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface py-16"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <app-icon name="school" [size]="32" className="text-primary"></app-icon>
          </div>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-dark">No hay inscripciones</h3>
            <p class="mt-1 text-sm text-muted">
              {{
                activeFilter() === 'all'
                  ? 'Aun no estas inscrito en ningun curso'
                  : 'No hay inscripciones con ese filtro'
              }}
            </p>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (enrollment of filteredEnrollments(); track enrollment.id) {
            <div
              class="group flex flex-col overflow-hidden rounded-xl border shadow-sm"
              [class.border-accent]="enrollment.status === 'completed'"
              [class.bg-accent-light]="enrollment.status === 'completed'"
              [class.border-border]="enrollment.status !== 'completed'"
            >
              <div class="relative aspect-video w-full overflow-hidden bg-bg">
                @if (enrollment.course?.thumbnailUrl) {
                  <img
                    [src]="getMediaUrl(enrollment.course?.thumbnailUrl)"
                    [alt]="enrollment.course?.title"
                    class="h-full w-full object-cover"
                    [class.brightness-90]="enrollment.status === 'completed'"
                  />
                } @else {
                  <div class="flex h-full items-center justify-center text-muted">
                    <app-icon name="school" [size]="32" className="text-primary-muted"></app-icon>
                  </div>
                }
                @if (enrollment.status === 'completed') {
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="rounded-full bg-accent px-4 py-2 text-sm font-bold text-dark"
                      >Completado</span
                    >
                  </div>
                }
                <span
                  class="absolute left-3 top-3 rounded-full px-2 py-1 text-xs"
                  [class.bg-primary]="enrollment.status === 'active'"
                  [class.text-white]="enrollment.status === 'active'"
                  [class.bg-accent]="enrollment.status === 'completed'"
                  [class.text-dark]="enrollment.status === 'completed'"
                  >{{
                    enrollment.status === 'active'
                      ? 'En Progreso'
                      : enrollment.status === 'completed'
                        ? 'Completado'
                        : enrollment.status
                  }}</span
                >
                <div class="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                  <div
                    class="h-full"
                    [class.bg-accent]="enrollment.status === 'completed'"
                    [class.bg-primary]="enrollment.status !== 'completed'"
                    [style.width.%]="enrollment.progressPercentage"
                  ></div>
                </div>
              </div>
              <div class="flex flex-1 flex-col p-4">
                <h3
                  class="truncate text-sm font-semibold"
                  [class.text-accent-dark]="enrollment.status === 'completed'"
                  [class.text-dark]="enrollment.status !== 'completed'"
                >
                  {{ enrollment.course?.title }}
                </h3>
                @if (enrollment.course?.description) {
                  <p class="mt-1 line-clamp-2 text-xs text-muted">
                    {{ enrollment.course?.description }}
                  </p>
                }
                <div class="mt-3 flex items-center gap-3">
                  @if (enrollment.status === 'completed') {
                    <div class="flex items-center gap-2 text-sm font-bold text-accent-dark">
                      <app-icon name="emoji_events" [size]="16"></app-icon>100%
                    </div>
                  } @else {
                    <div class="h-1.5 flex-1 rounded-full bg-border">
                      <div
                        class="h-full rounded-full bg-primary"
                        [style.width.%]="enrollment.progressPercentage"
                      ></div>
                    </div>
                    <span class="text-sm font-bold text-primary"
                      >{{ enrollment.progressPercentage }}%</span
                    >
                  }
                </div>
                <div class="mt-2 flex items-center justify-between text-xs text-muted">
                  <span
                    >{{ enrollment.completedLessons ?? 0 }}/{{
                      enrollment.totalLessons ?? 0
                    }}
                    lecciones</span
                  >
                  @if (enrollment.status === 'completed' && enrollment.completedAt) {
                    <span>{{ formatDate(enrollment.completedAt) }}</span>
                  }
                </div>
                @if (enrollment.status === 'completed') {
                  <button
                    type="button"
                    (click)="downloadCertificate(enrollment.id, $event)"
                    class="mt-3 rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-dark"
                  >
                    Descargar Certificado
                  </button>
                } @else {
                  <a
                    routerLink="/dashboard/courses/{{ enrollment.courseId }}"
                    class="mt-3 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-white text-center"
                    >{{ enrollment.progressPercentage === 0 ? 'Comenzar' : 'Continuar' }}</a
                  >
                }
              </div>
            </div>
          }
        </div>
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
export class ProgressComponent implements OnInit {
  private enrollmentsService = inject(EnrollmentsService);
  private certificatesService = inject(CertificatesApiService);

  enrollments = signal<EnrollmentWithCourse[]>([]);
  loading = signal(true);
  activeFilter = signal<'all' | 'active' | 'completed'>('all');

  filteredEnrollments = computed(() => {
    const f = this.activeFilter();
    const a = this.enrollments();
    return f === 'all' ? a : a.filter((e) => e.status === f);
  });

  totalEnrollments = computed(() => this.enrollments().length);
  completedCount = computed(
    () => this.enrollments().filter((e) => e.status === 'completed').length,
  );
  activeCount = computed(() => this.enrollments().filter((e) => e.status === 'active').length);
  avgProgress = computed(() => {
    const a = this.enrollments();
    return a.length
      ? Math.round(a.reduce((s, e) => s + (e.progressPercentage ?? 0), 0) / a.length)
      : 0;
  });

  filters = [
    { label: 'Todos', value: 'all' as const, count: this.totalEnrollments },
    { label: 'En Progreso', value: 'active' as const, count: this.activeCount },
    { label: 'Completados', value: 'completed' as const, count: this.completedCount },
  ];

  ngOnInit() {
    this.loadEnrollments();
  }

  async loadEnrollments() {
    try {
      const result = await firstValueFrom(this.enrollmentsService.getMyEnrollments());
      this.enrollments.set((result as any)?.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async downloadCertificate(id: string, e: Event) {
    e.preventDefault();
    try {
      const blob = await firstValueFrom(this.certificatesService.download(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificado.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  getMediaUrl(url: string | undefined): string {
    return getMediaUrl(url ?? '');
  }
}
