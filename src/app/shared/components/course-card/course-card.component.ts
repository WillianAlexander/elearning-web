import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { IconComponent } from '../icon/icon.component';
import { getMediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, IconComponent],
  template: `
    <div
      class="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md"
    >
      <!-- Thumbnail -->
      <div class="relative aspect-video w-full overflow-hidden bg-bg">
        @if (course().thumbnailUrl) {
          <img
            [src]="getMediaUrl(course().thumbnailUrl)"
            [alt]="course().title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        } @else {
          <div class="flex h-full flex-col items-center justify-center gap-1 text-muted">
            <span class="material-symbols-outlined text-4xl text-primary/40">school</span>
            <span class="text-xs">Sin imagen</span>
          </div>
        }

        <!-- Status badge -->
        @if (showStatus()) {
          <div class="absolute left-3 top-3">
            <app-status-badge [status]="course().status as any" />
          </div>
        }
      </div>

      <!-- Rejection reason alert (I-02) -->
      @if (course().status === 'rejected' && course().rejectionReason) {
        <div
          class="mx-4 mb-3 flex items-start gap-2 rounded-md bg-error-light p-3 text-xs text-error-dark"
        >
          <app-icon name="error" [size]="14" className="mt-0.5 shrink-0 text-error"></app-icon>
          <span>{{ course().rejectionReason }}</span>
        </div>
      }

      <!-- Content -->
      <div class="flex flex-1 flex-col p-4">
        <!-- Category -->
        @if (course().category) {
          <span class="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {{ course().category.name }}
          </span>
        }

        <!-- Title -->
        <h3 class="line-clamp-2 text-lg font-semibold text-dark group-hover:text-primary">
          {{ course().title }}
        </h3>

        <!-- Instructor -->
        @if (course().createdBy) {
          <div class="mt-2 flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary"
            >
              {{ course().createdBy.firstName?.charAt(0) ?? ''
              }}{{ course().createdBy.lastName?.charAt(0) ?? '' }}
            </div>
            <span class="text-xs font-medium text-muted">
              {{ course().createdBy.firstName }} {{ course().createdBy.lastName }}
            </span>
          </div>
        }

        <!-- Meta -->
        <div class="mt-3 flex items-center gap-4 text-xs font-medium text-muted">
          @if (course().estimatedDuration) {
            <span class="flex items-center gap-1">
              <app-icon name="schedule" [size]="14"></app-icon>
              {{ course().estimatedDuration }}h
            </span>
          }
          @if (course().difficultyLevel) {
            <span class="flex items-center gap-1 capitalize">
              <app-icon name="signal_cellular_alt" [size]="14"></app-icon>
              {{ course().difficultyLevel }}
            </span>
          }
        </div>

        <!-- Stats: Module/Lesson count (M-06) -->
        <div class="mt-3 flex items-center gap-3 text-xs text-muted">
          @if (course().moduleCount) {
            <span class="flex items-center gap-1">
              <app-icon name="folder" [size]="14"></app-icon>
              {{ course().moduleCount }} módulos
            </span>
          }
          @if (course().lessonCount) {
            <span class="flex items-center gap-1">
              <app-icon name="menu_book" [size]="14"></app-icon>
              {{ course().lessonCount }} lecciones
            </span>
          }
        </div>

        <!-- Actions -->
        <div class="mt-4 flex items-center justify-between border-t border-border pt-3">
          @if (showActions()) {
            <button
              type="button"
              (click)="onEdit.emit(course().id)"
              class="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <app-icon name="edit" [size]="16" className="mr-1"></app-icon>
              Editar
            </button>
          } @else {
            <div></div>
          }

          <!-- Action menu (I-01) -->
          @if (showMenu()) {
            <div class="relative">
              <button
                type="button"
                (click)="toggleMenu()"
                class="rounded-lg p-1.5 text-muted transition-colors hover:bg-bg hover:text-dark"
                aria-label="Acciones"
              >
                <app-icon name="more_vert" [size]="20"></app-icon>
              </button>

              @if (menuOpen()) {
                <div class="fixed inset-0 z-10" (click)="menuOpen.set(false)"></div>
                <div
                  class="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg"
                >
                  <!-- Common links -->
                  @if (!isAdmin()) {
                    <a
                      [routerLink]="'/dashboard/instructor/courses/' + course().id + '/settings'"
                      (click)="menuOpen.set(false)"
                      class="flex items-center gap-2.5 px-3 py-2 text-sm text-dark transition-colors hover:bg-bg"
                    >
                      <app-icon name="settings" [size]="16" className="text-muted"></app-icon>
                      Editar Info
                    </a>
                    <a
                      [routerLink]="'/dashboard/instructor/courses/' + course().id + '/edit'"
                      (click)="menuOpen.set(false)"
                      class="flex items-center gap-2.5 px-3 py-2 text-sm text-dark transition-colors hover:bg-bg"
                    >
                      <app-icon name="edit" [size]="16" className="text-muted"></app-icon>
                      Editar Contenido
                    </a>
                  }
                  <a
                    [routerLink]="'/dashboard/instructor/courses/' + course().id + '/preview'"
                    (click)="menuOpen.set(false)"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-dark transition-colors hover:bg-bg"
                  >
                    <app-icon name="visibility" [size]="16" className="text-muted"></app-icon>
                    Vista previa
                  </a>

                  <!-- Instructor actions -->
                  @if (
                    !isAdmin() && (course().status === 'draft' || course().status === 'rejected')
                  ) {
                    <div class="my-1 border-t border-border"></div>
                    <button
                      type="button"
                      (click)="menuOpen.set(false); onRequestReview.emit(course().id)"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-accent-dark transition-colors hover:bg-bg"
                    >
                      <app-icon name="send" [size]="16"></app-icon>
                      Solicitar Revisión
                    </button>
                  }

                  <!-- Admin actions -->
                  @if (isAdmin() && course().status === 'pending_review') {
                    <div class="my-1 border-t border-border"></div>
                    <button
                      type="button"
                      (click)="menuOpen.set(false); onApprove.emit(course().id)"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-bg"
                    >
                      <app-icon name="check_circle" [size]="16"></app-icon>
                      Aprobar y Publicar
                    </button>
                    <button
                      type="button"
                      (click)="menuOpen.set(false); onReject.emit(course().id)"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-bg"
                    >
                      <app-icon name="cancel" [size]="16"></app-icon>
                      Rechazar
                    </button>
                  }

                  @if (isAdmin() && course().status === 'published') {
                    <div class="my-1 border-t border-border"></div>
                    <button
                      type="button"
                      (click)="menuOpen.set(false); onArchive.emit(course().id)"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-alert-dark transition-colors hover:bg-bg"
                    >
                      <app-icon name="inventory_2" [size]="16"></app-icon>
                      Archivar
                    </button>
                  }

                  <!-- Delete -->
                  @if (canDelete()) {
                    <div class="my-1 border-t border-border"></div>
                    <button
                      type="button"
                      (click)="menuOpen.set(false); onDelete.emit(course().id)"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-bg"
                    >
                      <app-icon name="delete" [size]="16"></app-icon>
                      Eliminar
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
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
export class CourseCardComponent {
  readonly course = input.required<any>();
  readonly showStatus = input<boolean>(true);
  readonly showActions = input<boolean>(false);
  readonly showMenu = input<boolean>(false);
  readonly isAdmin = input<boolean>(false);

  readonly onEdit = output<string>();
  readonly onDelete = output<string>();
  readonly onRequestReview = output<string>();
  readonly onApprove = output<string>();
  readonly onReject = output<string>();
  readonly onArchive = output<string>();

  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  getMediaUrl(url: string | undefined | null): string {
    return getMediaUrl(url ?? '');
  }

  canDelete(): boolean {
    if (this.isAdmin()) return true;
    return this.course().status === 'draft';
  }
}
