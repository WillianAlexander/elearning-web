import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../../../../core/services/courses.service';
import { CategoriesApiService } from '../../../../../core/services/categories-api.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

interface Category {
  id: string;
  name: string;
}

interface CourseData {
  title: string;
  description?: string;
  categoryId?: string;
  difficulty?: string;
  thumbnailUrl?: string;
  difficultyLevel?: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-course-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <div class="mb-6">
        <button
          type="button"
          (click)="goBack()"
          class="mb-4 flex items-center gap-1 text-sm text-muted transition-colors hover:text-dark"
        >
          <app-icon name="arrow_back" [size]="16"></app-icon>
          Volver
        </button>
        <h1 class="text-2xl font-bold text-dark">Editar Curso</h1>
        <p class="mt-1 text-sm text-muted">Modifica la información básica del curso.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          ></div>
        </div>
      }

      @if (error()) {
        <div class="rounded-md bg-error-light p-4">
          <p class="text-sm text-error-dark">{{ error() }}</p>
        </div>
      }

      @if (!loading() && !error() && course()) {
        <div class="rounded-lg border border-border bg-surface p-6">
          <form (ngSubmit)="save()" class="flex flex-col gap-5">
            <!-- Title -->
            <div class="flex flex-col gap-1.5">
              <label for="title" class="text-sm font-medium text-dark">Título del curso</label>
              <input
                id="title"
                type="text"
                [(ngModel)]="form.title"
                name="title"
                required
                class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label for="description" class="text-sm font-medium text-dark">Descripción</label>
              <textarea
                id="description"
                [(ngModel)]="form.description"
                name="description"
                rows="4"
                class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              ></textarea>
            </div>

            <!-- Category -->
            <div class="flex flex-col gap-1.5">
              <label for="category" class="text-sm font-medium text-dark">Categoría</label>
              <select
                id="category"
                [(ngModel)]="form.categoryId"
                name="categoryId"
                class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccionar categoría</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Difficulty -->
            <div class="flex flex-col gap-1.5">
              <label for="difficulty" class="text-sm font-medium text-dark">Dificultad</label>
              <select
                id="difficulty"
                [(ngModel)]="form.difficulty"
                name="difficulty"
                class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccionar dificultad</option>
                <option value="beginner">Básico</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <!-- Thumbnail URL -->
            <div class="flex flex-col gap-1.5">
              <label for="thumbnail" class="text-sm font-medium text-dark">URL de imagen</label>
              <input
                id="thumbnail"
                type="text"
                [(ngModel)]="form.thumbnailUrl"
                name="thumbnailUrl"
                placeholder="https://..."
                class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                (click)="goBack()"
                class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="saving()"
                class="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                @if (saving()) {
                  <span>Guardando...</span>
                } @else {
                  <span>Guardar Cambios</span>
                }
              </button>
            </div>
          </form>
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
export class CourseSettingsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);
  private readonly categoriesService = inject(CategoriesApiService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly course = signal<any>(null);
  readonly categories = signal<Category[]>([]);

  form = {
    title: '',
    description: '',
    categoryId: '',
    difficulty: '',
    thumbnailUrl: '',
  };

  private courseId = '';

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadData();
  }

  private loadData(): void {
    // Load categories
    this.categoriesService.list().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {},
    });

    // Load course
    if (this.courseId) {
      this.coursesService.getCourseById(this.courseId).subscribe({
        next: (course) => {
          this.course.set(course);
          this.form = {
            title: course.title ?? '',
            description: course.description ?? '',
            categoryId: course.categoryId ?? '',
            difficulty: course.difficultyLevel ?? '',
            thumbnailUrl: course.thumbnailUrl ?? '',
          };
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Curso no encontrado');
          this.loading.set(false);
        },
      });
    } else {
      this.error.set('ID de curso no proporcionado');
      this.loading.set(false);
    }
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);

    this.coursesService
      .updateCourse(this.courseId, {
        title: this.form.title,
        description: this.form.description,
        categoryId: this.form.categoryId || undefined,
        difficulty: this.form.difficulty || undefined,
        thumbnailUrl: this.form.thumbnailUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/dashboard/instructor/courses']);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.message ?? 'Error al guardar');
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/dashboard/instructor/courses']);
  }
}
