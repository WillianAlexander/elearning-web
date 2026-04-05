import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CategoriesApiService, Category } from '../../../../core/services/categories-api.service';

interface FlatCategory {
  id: string;
  name: string;
  depth: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <span class="material-symbols-outlined text-2xl text-primary">category</span>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Categorías</h1>
            <p class="text-sm text-muted">
              {{ totalCount() }} categoría{{ totalCount() !== 1 ? 's' : '' }} para organizar cursos
            </p>
          </div>
        </div>
        <button
          type="button"
          (click)="startCreate()"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-subtle transition-colors hover:bg-primary-hover"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          Nueva Categoría
        </button>
      </div>

      <!-- Create Form -->
      @if (showCreate()) {
        <section class="mt-6 rounded-xl border border-primary-muted bg-surface p-5 shadow-subtle">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-dark">
            <span class="material-symbols-outlined text-lg text-primary">add_circle</span>
            Nueva Categoría
          </h3>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-dark">Nombre</label>
              <input
                type="text"
                placeholder="Ej: Normativa Interna"
                [(ngModel)]="formName"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-dark">Descripción</label>
              <input
                type="text"
                placeholder="Opcional"
                [(ngModel)]="formDescription"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-dark">Categoría padre</label>
              <select
                [(ngModel)]="formParentId"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Sin padre (raíz)</option>
                @for (cat of flatCategories(); track cat.id) {
                  <option [value]="cat.id">{{ '—'.repeat(cat.depth) }} {{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              (click)="handleCreate()"
              [disabled]="creating() || !formName.trim()"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              @if (creating()) {
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                ></span>
                Creando...
              } @else {
                <span class="material-symbols-outlined text-lg">check</span>
                Crear Categoría
              }
            </button>
            <button
              type="button"
              (click)="resetForm()"
              class="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-dark"
            >
              Cancelar
            </button>
          </div>
        </section>
      }

      <!-- Content -->
      <div class="mt-6">
        @if (loading()) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-subtle"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-muted border-t-primary"
            ></div>
            <p class="text-sm text-muted">Cargando categorías...</p>
          </div>
        }

        @if (error()) {
          <div
            class="flex items-center gap-3 rounded-xl border border-error-muted bg-error-light p-4"
          >
            <span class="material-symbols-outlined text-2xl text-error">error</span>
            <p class="text-sm text-error-dark">Error al cargar categorías: {{ error() }}</p>
          </div>
        }

        @if (!loading() && !error() && (!categories() || categories()!.length === 0)) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-subtle"
          >
            <span class="material-symbols-outlined text-4xl text-muted">folder_off</span>
            <p class="text-sm font-medium text-dark">No hay categorías</p>
            <p class="text-xs text-muted">Crea la primera categoría para organizar tus cursos.</p>
          </div>
        }

        @if (!loading() && !error() && categories() && categories()!.length > 0) {
          <div class="rounded-xl border border-border bg-surface shadow-subtle">
            <ng-container
              *ngTemplateOutlet="
                categoryTreeTemplate;
                context: { $implicit: categories(), depth: 0 }
              "
            ></ng-container>
          </div>
        }
      </div>

      <!-- Delete Dialog -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="mx-4 max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h3 class="text-lg font-semibold text-dark">Eliminar categoría</h3>
            <p class="mt-2 text-sm text-muted">
              ¿Estás seguro de eliminar "{{ deleteTarget()?.name }}"? Esta acción no se puede
              deshacer.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="deleteTarget.set(null)"
                class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="handleDelete()"
                class="rounded-md bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error-hover"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Category Tree Template -->
    <ng-template #categoryTreeTemplate let-categories let-depth="depth">
      <div [class]="depth > 0 ? 'ml-6 border-l-2 border-primary-muted/50 pl-4' : ''">
        @for (category of categories; track category.id; let idx = $index) {
          @let isEditing = editingId() === category.id;
          @let hasChildren = category.children && category.children.length > 0;
          @let isLast = idx === categories.length - 1;

          <div>
            @if (isEditing) {
              <!-- Edit Mode -->
              <div class="border-b border-border bg-alert-light/50 px-5 py-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div class="flex-1">
                    <input
                      type="text"
                      [(ngModel)]="formName"
                      placeholder="Nombre"
                      class="w-full rounded-lg border border-alert-muted bg-surface px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div class="flex-1">
                    <input
                      type="text"
                      [(ngModel)]="formDescription"
                      placeholder="Descripción (opcional)"
                      class="w-full rounded-lg border border-alert-muted bg-surface px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button
                      type="button"
                      (click)="handleUpdate(category.id)"
                      [disabled]="saving() || !formName.trim()"
                      class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
                    >
                      <span class="material-symbols-outlined text-base">check</span>
                      Guardar
                    </button>
                    <button
                      type="button"
                      (click)="resetForm()"
                      class="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-dark"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <!-- View Mode -->
              <div
                class="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-primary-light/30"
                [class.border-b]="!isLast || hasChildren"
                [class.border-border]="!isLast || hasChildren"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    [class.bg-primary-light]="depth === 0"
                    [class.text-primary]="depth === 0"
                    [class.bg-bg]="depth > 0"
                    [class.text-muted]="depth > 0"
                  >
                    <span class="material-symbols-outlined text-base">{{
                      hasChildren ? 'folder_open' : 'label'
                    }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-dark">{{ category.name }}</p>
                    @if (category.description) {
                      <p class="truncate text-xs text-muted">{{ category.description }}</p>
                    }
                  </div>
                  @if (hasChildren) {
                    <span class="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted">
                      {{ category.children?.length }}
                    </span>
                  }
                </div>
                <div
                  class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    type="button"
                    (click)="startEdit(category)"
                    class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-light"
                  >
                    <span class="material-symbols-outlined text-base">edit</span>
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="deleteTarget.set(category)"
                    class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error-light"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                    Eliminar
                  </button>
                </div>
              </div>
            }

            @if (hasChildren) {
              <div [class.border-b]="!isLast">
                <ng-container
                  *ngTemplateOutlet="
                    categoryTreeTemplate;
                    context: { $implicit: category.children, depth: depth + 1 }
                  "
                ></ng-container>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class CategoriesComponent implements OnInit {
  private categoriesService = inject(CategoriesApiService);

  categories = signal<Category[] | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  creating = signal(false);

  // Form state
  showCreate = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<Category | null>(null);
  formName = '';
  formDescription = '';
  formParentId = '';

  flatCategories = computed(() => {
    const cats = this.categories();
    if (!cats) return [];
    const result: FlatCategory[] = [];
    const walk = (items: Category[], depth: number) => {
      for (const cat of items) {
        result.push({ id: cat.id, name: cat.name, depth });
        if (cat.children?.length) walk(cat.children, depth + 1);
      }
    };
    walk(cats, 0);
    return result;
  });

  totalCount = computed(() => this.flatCategories().length);

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const categories = await firstValueFrom(this.categoriesService.list());
      this.categories.set(categories);
    } catch (e: any) {
      this.error.set(e.message || 'Error al cargar categorías');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate() {
    this.formName = '';
    this.formDescription = '';
    this.formParentId = '';
    this.editingId.set(null);
    this.showCreate.set(true);
  }

  resetForm() {
    this.formName = '';
    this.formDescription = '';
    this.formParentId = '';
    this.showCreate.set(false);
    this.editingId.set(null);
  }

  startEdit(category: Category) {
    this.editingId.set(category.id);
    this.formName = category.name;
    this.formDescription = category.description ?? '';
    this.showCreate.set(false);
  }

  async handleCreate() {
    if (!this.formName.trim()) return;
    this.creating.set(true);
    try {
      await firstValueFrom(
        this.categoriesService.create({
          name: this.formName.trim(),
          description: this.formDescription.trim() || undefined,
          parentId: this.formParentId || undefined,
        }),
      );
      this.resetForm();
      await this.loadCategories();
    } catch (e: any) {
      this.error.set(e.message || 'Error al crear categoría');
    } finally {
      this.creating.set(false);
    }
  }

  async handleUpdate(id: string) {
    if (!this.formName.trim()) return;
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.categoriesService.update(id, {
          name: this.formName.trim(),
          description: this.formDescription.trim() || undefined,
        }),
      );
      this.resetForm();
      await this.loadCategories();
    } catch (e: any) {
      this.error.set(e.message || 'Error al actualizar categoría');
    } finally {
      this.saving.set(false);
    }
  }

  async handleDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    try {
      await firstValueFrom(this.categoriesService.delete(target.id));
      this.deleteTarget.set(null);
      await this.loadCategories();
    } catch (e: any) {
      this.error.set(e.message || 'Error al eliminar categoría');
    }
  }
}
