import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CoursesService } from '../../../../../core/services/courses.service';
import { CategoriesApiService } from '../../../../../core/services/categories-api.service';
import { TagInputComponent } from '../../../../../shared/components/tag-input/tag-input.component';

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TagInputComponent],
  template: `
    <div class="mx-auto max-w-2xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-dark">Crear Nuevo Curso</h1>
        <p class="mt-1 text-sm text-muted">
          Completa la informacion basica del curso. Podras agregar modulos y lecciones despues.
        </p>
      </div>

      <div class="rounded-lg border border-border bg-surface p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Title -->
          <div>
            <label for="course-title" class="block text-sm font-medium text-dark">
              Titulo del curso <span class="text-error">*</span>
            </label>
            <input
              id="course-title"
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              maxlength="255"
              placeholder="Ej: Introduccion a la Banca Digital"
              class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="course-desc" class="block text-sm font-medium text-dark">Descripcion</label>
            <textarea
              id="course-desc"
              [(ngModel)]="description"
              name="description"
              rows="4"
              placeholder="Describe de que trata este curso..."
              class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            ></textarea>
          </div>

          <!-- Category -->
          <div>
            <label for="course-category" class="block text-sm font-medium text-dark"
              >Categoria</label
            >
            <select
              id="course-category"
              [(ngModel)]="categoryId"
              name="categoryId"
              class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">Seleccionar categoria</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-dark">Etiquetas</label>
            <app-tag-input
              [tags]="tags"
              (tagsChange)="tags = $event"
              placeholder="Escribir y Enter para agregar"
              class="mt-1"
            ></app-tag-input>
          </div>

          <!-- Thumbnail -->
          <div>
            <label class="block text-sm font-medium text-dark">Imagen de portada</label>
            @if (thumbnailUrl) {
              <div class="mt-1">
                <img
                  [src]="thumbnailUrl"
                  alt="Portada del curso"
                  class="h-32 w-auto rounded-md object-cover"
                />
                <button
                  type="button"
                  (click)="thumbnailUrl = ''"
                  class="mt-1 text-xs text-error hover:text-error-dark"
                >
                  Eliminar imagen
                </button>
              </div>
            } @else {
              <div class="mt-1">
                <div
                  class="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-muted"
                  role="button"
                  tabindex="0"
                  (click)="fileInput.click()"
                  (keydown.enter)="fileInput.click()"
                >
                  @if (uploading()) {
                    <div
                      class="mb-2 h-8 w-8 animate-spin rounded-full border-[3px] border-primary-muted border-t-primary"
                    ></div>
                    <p class="text-sm text-muted">Subiendo imagen...</p>
                  } @else {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="mb-2 h-8 w-8 text-muted"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      ></path>
                    </svg>
                    <p class="text-sm text-muted">
                      Arrastra una imagen o haz clic para seleccionar
                    </p>
                    <p class="mt-1 text-xs text-muted/70">Tipos aceptados: image/*</p>
                  }
                  <input
                    #fileInput
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onFileSelect($event)"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Duration + Difficulty row -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="course-duration" class="block text-sm font-medium text-dark">
                Duracion estimada (minutos)
              </label>
              <input
                id="course-duration"
                type="number"
                [(ngModel)]="estimatedDuration"
                name="estimatedDuration"
                min="1"
                placeholder="120"
                class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label for="course-difficulty" class="block text-sm font-medium text-dark">
                Nivel de dificultad
              </label>
              <select
                id="course-difficulty"
                [(ngModel)]="difficultyLevel"
                name="difficultyLevel"
                class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Sin especificar</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              routerLink="/dashboard/instructor/courses"
              class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="submitting() || !title.trim()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting() ? 'Guardando...' : 'Crear Curso' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CourseFormComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private categoriesService = inject(CategoriesApiService);
  private router = inject(Router);

  title = '';
  description = '';
  categoryId = '';
  difficultyLevel = '';
  estimatedDuration: number | null = null;
  thumbnailUrl = '';
  tags: string[] = [];
  submitting = signal(false);
  uploading = signal(false);
  categories = signal<Category[]>([]);

  async ngOnInit() {
    try {
      const cats = await firstValueFrom(this.categoriesService.list());
      this.categories.set(cats ?? []);
    } catch (e) {
      console.error(e);
    }
  }

  async onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // For now, use a local preview URL
    // TODO: integrate with MediaApiService.upload() when MinIO is connected
    this.uploading.set(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailUrl = reader.result as string;
        this.uploading.set(false);
      };
      reader.onerror = () => {
        this.uploading.set(false);
      };
      reader.readAsDataURL(file);
    } catch {
      this.uploading.set(false);
    }
  }

  async onSubmit() {
    if (!this.title.trim()) return;
    this.submitting.set(true);
    try {
      const payload: any = { title: this.title.trim() };
      if (this.description.trim()) payload.description = this.description.trim();
      if (this.categoryId) payload.categoryId = this.categoryId;
      if (this.thumbnailUrl && !this.thumbnailUrl.startsWith('data:'))
        payload.thumbnailUrl = this.thumbnailUrl;
      if (this.estimatedDuration) payload.estimatedDuration = this.estimatedDuration;
      if (this.difficultyLevel) payload.difficultyLevel = this.difficultyLevel;
      if (this.tags.length > 0) payload.tagNames = this.tags;

      const course = await firstValueFrom(this.coursesService.createCourse(payload));
      const courseId = (course as any)?.id;
      if (courseId) {
        this.router.navigate(['/dashboard/instructor/courses', courseId, 'edit']);
      } else {
        this.router.navigate(['/dashboard/instructor/courses']);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.submitting.set(false);
    }
  }
}
