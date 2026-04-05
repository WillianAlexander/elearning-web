import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CoursesService } from '../../../../../core/services/courses.service';
import { AuthStore } from '../../../../../core/stores/auth.store';
import { getMediaUrl } from '../../../../../shared/utils/media-url';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { BulkEmailDialogComponent } from '../../../../../shared/components/bulk-email-dialog/bulk-email-dialog.component';
import { BulkEmailApiService } from '../../../../../core/services/bulk-email-api.service';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [StatCardComponent, BulkEmailDialogComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <span class="material-symbols-outlined text-2xl text-primary">school</span>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Mis Cursos</h1>
            <p class="text-sm text-muted">Gestiona tus cursos creados</p>
          </div>
        </div>
        <a
          href="/dashboard/instructor/courses/new"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <span class="material-symbols-outlined">add</span>
          Nuevo Curso
        </a>
      </div>

      <!-- Stats -->
      <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <app-stat-card label="Total" [value]="courses().length" icon="school" color="primary" />
        <app-stat-card label="Borradores" [value]="draftCount()" icon="edit_note" color="accent" />
        <app-stat-card label="En Revision" [value]="pendingCount()" icon="pending" color="alert" />
        <app-stat-card
          label="Publicados"
          [value]="publishedCount()"
          icon="check_circle"
          color="primary"
        />
      </div>

      <!-- Content -->
      @if (loading()) {
        <div
          class="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-sm"
        >
          <div
            class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/40 border-t-primary"
          ></div>
          <p class="text-sm text-muted">Cargando cursos...</p>
        </div>
      }

      @if (error()) {
        <div class="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <span class="material-symbols-outlined shrink-0 text-red-600">error</span>
          <p class="text-sm text-red-800">Error al cargar cursos: {{ error() }}</p>
        </div>
      }

      @if (!loading() && !error() && courses().length === 0) {
        <div
          class="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-surface py-16 shadow-sm"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span class="material-symbols-outlined text-4xl text-primary">school</span>
          </div>
          <div class="text-center">
            <h3 class="font-heading text-lg font-semibold text-dark">Crea tu primer curso</h3>
            <p class="mt-1 max-w-md text-sm text-muted">
              Comenza a compartir tu conocimiento con los colaboradores de la cooperativa.
            </p>
          </div>
          <a
            href="/dashboard/instructor/courses/new"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span class="material-symbols-outlined">add</span>
            Crear Curso
          </a>
        </div>
      }

      @if (!loading() && !error() && courses().length > 0) {
        <div class="mt-6 flex flex-col gap-3">
          @for (course of courses(); track course.id) {
            <div
              class="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg">
                @if (course.thumbnailUrl) {
                  <img
                    [src]="getMediaUrl(course.thumbnailUrl)"
                    [alt]="course.title"
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
                  {{ course.title }}
                </h3>
                <div class="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span [class]="getStatusClasses(course.status)">
                    <span class="material-symbols-outlined text-base">{{
                      getStatusIcon(course.status)
                    }}</span>
                    {{ getStatusLabel(course.status) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">view_module</span>
                    {{ course.moduleCount ?? 0 }} modulos
                  </span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <a
                  [href]="'/dashboard/instructor/courses/' + course.id + '/edit'"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                  title="Editar"
                >
                  <span class="material-symbols-outlined">edit</span>
                </a>
                <a
                  [href]="'/dashboard/instructor/courses/' + course.id + '/preview'"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                  title="Vista previa"
                >
                  <span class="material-symbols-outlined">visibility</span>
                </a>
                @if (course.status === 'published') {
                  <a
                    [href]="'/dashboard/courses/' + course.id"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                    title="Ver en catalogo"
                  >
                    <span class="material-symbols-outlined">open_in_new</span>
                  </a>
                  <button
                    type="button"
                    (click)="openBulkEmail(course.id, $event)"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                    title="Enviar email masivo"
                  >
                    <span class="material-symbols-outlined">mail</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Bulk Email Dialog -->
    <app-bulk-email-dialog
      [open]="bulkEmailOpen()"
      [courseId]="selectedCourseId()"
      [isLoading]="bulkEmailLoading()"
      (closed)="closeBulkEmail()"
      (onSubmit)="sendBulkEmail($event)"
    ></app-bulk-email-dialog>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class InstructorCoursesComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly authStore = inject(AuthStore);
  private readonly bulkEmailService = inject(BulkEmailApiService);

  readonly courses = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly bulkEmailOpen = signal(false);
  readonly selectedCourseId = signal('');
  readonly bulkEmailLoading = signal(false);

  readonly draftCount = () => this.courses().filter((c) => c.status === 'draft').length;
  readonly pendingCount = () => this.courses().filter((c) => c.status === 'pending_review').length;
  readonly publishedCount = () => this.courses().filter((c) => c.status === 'published').length;

  constructor() {
    this.loadCourses();
  }

  private loadCourses(): void {
    const userId = this.authStore.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    this.coursesService.getCourses({ createdById: userId, pageSize: 100 } as any).subscribe({
      next: (result) => {
        this.courses.set(result?.items ?? result ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getMediaUrl(url: string): string {
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

  openBulkEmail(courseId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedCourseId.set(courseId);
    this.bulkEmailOpen.set(true);
  }

  closeBulkEmail(): void {
    this.bulkEmailOpen.set(false);
    this.selectedCourseId.set('');
  }

  async sendBulkEmail(payload: { subject: string; body: string }): Promise<void> {
    const courseId = this.selectedCourseId();
    if (!courseId) return;
    this.bulkEmailLoading.set(true);
    try {
      await firstValueFrom(this.bulkEmailService.send(courseId, payload));
      this.closeBulkEmail();
    } catch (e) {
      console.error(e);
    } finally {
      this.bulkEmailLoading.set(false);
    }
  }
}
