import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CoursesService, CourseFilters } from '../../../../core/services/courses.service';
import { Course } from '../../../../core/types/models';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

type StatusFilter = 'all' | 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';

interface CourseWithStatus extends Course {
  status: string;
}

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <app-icon name="admin_panel_settings" [size]="24" className="text-primary"></app-icon>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Gestión de Cursos</h1>
            <p class="text-sm text-muted">
              {{ totalCount() }} curso{{ totalCount() !== 1 ? 's' : '' }} en total
            </p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <!-- Status filter -->
          <div class="flex items-center gap-1 rounded-lg bg-bg p-1">
            @for (status of statusOptions; track status.value) {
              <button
                type="button"
                (click)="statusFilter.set(status.value)"
                class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                [class.bg-surface]="statusFilter() === status.value"
                [class.text-dark]="statusFilter() === status.value"
                [class.shadow-subtle]="statusFilter() === status.value"
                [class.text-muted]="statusFilter() !== status.value"
                [class.hover:text-dark]="statusFilter() !== status.value"
              >
                {{ status.label }}
              </button>
            }
          </div>
          <!-- Search -->
          <div class="relative flex-1 sm:max-w-xs">
            <app-icon
              name="search"
              [size]="20"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            ></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar cursos..."
              class="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="mt-6">
        @if (loading()) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-subtle"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-muted border-t-primary"
            ></div>
            <p class="text-sm text-muted">Cargando cursos...</p>
          </div>
        }

        @if (error()) {
          <div
            class="flex items-center gap-3 rounded-xl border border-error-muted bg-error-light p-4"
          >
            <app-icon name="error" [size]="24" className="shrink-0 text-error"></app-icon>
            <p class="text-sm text-error-dark">Error al cargar cursos: {{ error() }}</p>
          </div>
        }

        @if (!loading() && !error() && courses().length === 0) {
          <app-empty-state
            title="No hay cursos"
            description="No se encontraron cursos con los filtros seleccionados."
          ></app-empty-state>
        }

        @if (!loading() && !error() && courses().length > 0) {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (course of courses(); track course.id) {
              <div
                class="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-subtle transition-shadow hover:shadow-md"
              >
                <!-- Thumbnail -->
                <div class="aspect-video w-full bg-bg">
                  @if (course.thumbnailUrl) {
                    <img
                      [src]="course.thumbnailUrl"
                      [alt]="course.title"
                      class="h-full w-full object-cover"
                    />
                  } @else {
                    <div class="flex h-full items-center justify-center">
                      <app-icon name="school" [size]="32" className="text-muted"></app-icon>
                    </div>
                  }
                </div>
                <!-- Content -->
                <div class="p-4">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="line-clamp-2 text-sm font-semibold text-dark">{{ course.title }}</h3>
                    <app-status-badge [status]="course.status"></app-status-badge>
                  </div>
                  @if (course.description) {
                    <p class="mt-1 text-xs text-muted line-clamp-2">{{ course.description }}</p>
                  }
                  <!-- Actions -->
                  <div class="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      (click)="handlePublish(course.id)"
                      class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-light"
                    >
                      <app-icon name="check_circle" [size]="14"></app-icon>
                      Aprobar
                    </button>
                    <button
                      type="button"
                      (click)="rejectTarget.set(course.id)"
                      class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error-light"
                    >
                      <app-icon name="cancel" [size]="14"></app-icon>
                      Rechazar
                    </button>
                    <button
                      type="button"
                      (click)="handleArchive(course.id)"
                      class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-bg"
                    >
                      <app-icon name="archive" [size]="14"></app-icon>
                      Archivar
                    </button>
                    <button
                      type="button"
                      (click)="deleteTarget.set(course.id)"
                      class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error-light"
                    >
                      <app-icon name="delete" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Delete confirmation -->
      <app-confirm-dialog
        [open]="!!deleteTarget()"
        title="Eliminar Curso"
        message="¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        (confirm)="handleDelete()"
        (cancel)="deleteTarget.set(null)"
      ></app-confirm-dialog>

      <!-- Reject dialog -->
      @if (rejectTarget()) {
        <dialog
          open
          class="fixed inset-0 z-50 m-auto max-w-md rounded-lg border border-border bg-surface p-0 shadow-lg backdrop:bg-black/50"
        >
          <div class="p-6">
            <h3 class="text-lg font-semibold text-dark">Rechazar Curso</h3>
            <p class="mt-2 text-sm text-muted">
              Indica el motivo del rechazo. El instructor lo verá y podrá corregir el curso.
            </p>

            <textarea
              [(ngModel)]="rejectReason"
              placeholder="Describe qué debe corregir el instructor..."
              rows="4"
              class="mt-4 w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            ></textarea>
            @if (rejectReason.length > 0 && rejectReason.trim().length < 10) {
              <p class="mt-1 text-xs text-error">El motivo debe tener al menos 10 caracteres</p>
            }

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="cancelReject()"
                class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="handleReject()"
                [disabled]="rejectReason.trim().length < 10"
                class="rounded-md bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rechazar Curso
              </button>
            </div>
          </div>
        </dialog>
      }
    </div>
  `,
})
export class AdminCoursesComponent implements OnInit {
  private coursesService = inject(CoursesService);

  courses = signal<CourseWithStatus[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  statusFilter = signal<StatusFilter>('all');
  searchQuery = '';
  deleteTarget = signal<string | null>(null);
  rejectTarget = signal<string | null>(null);
  rejectReason = '';

  statusOptions = [
    { value: 'all' as StatusFilter, label: 'Todos' },
    { value: 'draft' as StatusFilter, label: 'Borrador' },
    { value: 'pending_review' as StatusFilter, label: 'Revisión' },
    { value: 'published' as StatusFilter, label: 'Publicado' },
    { value: 'rejected' as StatusFilter, label: 'Rechazado' },
    { value: 'archived' as StatusFilter, label: 'Archivado' },
  ];

  totalCount = computed(() => this.courses().length);

  async ngOnInit() {
    await this.loadCourses();
  }

  async loadCourses() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const filters: CourseFilters = {
        page: 1,
        pageSize: 50,
      };
      if (this.statusFilter() !== 'all') {
        filters.status = this.statusFilter();
      }
      if (this.searchQuery) {
        filters.search = this.searchQuery;
      }
      const response = await firstValueFrom(this.coursesService.getCourses(filters));
      this.courses.set(response.items);
    } catch (e: any) {
      this.error.set(e.message || 'Error al cargar cursos');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.loadCourses();
  }

  async handlePublish(id: string) {
    try {
      await firstValueFrom(this.coursesService.approveCourse(id));
      await this.loadCourses();
    } catch (e: any) {
      this.error.set(e.message || 'Error al publicar el curso');
    }
  }

  async handleReject() {
    const target = this.rejectTarget();
    if (!target || this.rejectReason.trim().length < 10) return;
    try {
      await firstValueFrom(this.coursesService.rejectCourse(target, this.rejectReason));
      this.cancelReject();
      await this.loadCourses();
    } catch (e: any) {
      this.error.set(e.message || 'Error al rechazar el curso');
    }
  }

  cancelReject() {
    this.rejectTarget.set(null);
    this.rejectReason = '';
  }

  async handleArchive(id: string) {
    try {
      await firstValueFrom(this.coursesService.archiveCourse(id));
      await this.loadCourses();
    } catch (e: any) {
      this.error.set(e.message || 'Error al archivar el curso');
    }
  }

  async handleDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    try {
      await firstValueFrom(this.coursesService.deleteCourse(target));
      this.deleteTarget.set(null);
      await this.loadCourses();
    } catch (e: any) {
      this.error.set(e.message || 'Error al eliminar el curso');
    }
  }
}
