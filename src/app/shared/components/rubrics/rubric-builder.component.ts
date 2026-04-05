import { Component, input, output, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CreateRubricLevelPayload {
  label: string;
  description: string;
  score: number;
  orderIndex: number;
}

interface CreateRubricCriterionPayload {
  name: string;
  description: string;
  weight: number;
  orderIndex: number;
  levels: CreateRubricLevelPayload[];
}

interface CreateRubricPayload {
  title: string;
  description?: string;
  criteria: CreateRubricCriterionPayload[];
}

const DEFAULT_LEVELS: CreateRubricLevelPayload[] = [
  { label: 'Insuficiente', description: '', score: 1, orderIndex: 0 },
  { label: 'En desarrollo', description: '', score: 2, orderIndex: 1 },
  { label: 'Competente', description: '', score: 3, orderIndex: 2 },
  { label: 'Excelente', description: '', score: 4, orderIndex: 3 },
];

function createEmptyCriterion(orderIndex: number): CreateRubricCriterionPayload {
  return {
    name: '',
    description: '',
    weight: 1,
    orderIndex,
    levels: DEFAULT_LEVELS.map((l) => ({ ...l })),
  };
}

@Component({
  selector: 'app-rubric-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (submit)="handleSubmit($event)" class="space-y-6">
      <!-- Rubric Metadata -->
      <div class="space-y-3">
        <div>
          <label for="rubric-title" class="block text-sm font-medium text-dark">
            Titulo de la rubrica
          </label>
          <input
            id="rubric-title"
            type="text"
            [(ngModel)]="title"
            name="title"
            class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Ej: Evaluacion del proyecto final"
            required
          />
        </div>
        <div>
          <label for="rubric-desc" class="block text-sm font-medium text-dark">
            Descripcion (opcional)
          </label>
          <textarea
            id="rubric-desc"
            [(ngModel)]="description"
            name="description"
            rows="2"
            class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Descripcion de la rubrica..."
          ></textarea>
        </div>
      </div>

      <!-- Criteria -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-dark">Criterios de evaluacion</h3>
          <button
            type="button"
            (click)="addCriterion()"
            class="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <span class="material-symbols-outlined text-base">add</span>
            Agregar criterio
          </button>
        </div>

        @for (criterion of criteria(); track $index; let ci = $index) {
          <div class="rounded-lg border border-border bg-surface p-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="flex-1 space-y-2">
                <input
                  type="text"
                  [ngModel]="criterion.name"
                  (ngModelChange)="updateCriterion(ci, 'name', $event)"
                  name="criterion-name-{{ ci }}"
                  class="w-full rounded-md border border-border px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Nombre del criterio"
                  [attr.aria-label]="'Nombre del criterio ' + (ci + 1)"
                />
                <input
                  type="text"
                  [ngModel]="criterion.description"
                  (ngModelChange)="updateCriterion(ci, 'description', $event)"
                  name="criterion-desc-{{ ci }}"
                  class="w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Descripcion del criterio (opcional)"
                  [attr.aria-label]="'Descripcion del criterio ' + (ci + 1)"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-xs text-muted">Peso:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  [ngModel]="criterion.weight"
                  (ngModelChange)="updateCriterion(ci, 'weight', $event)"
                  name="criterion-weight-{{ ci }}"
                  class="w-16 rounded-md border border-border px-2 py-1.5 text-sm text-center focus:border-primary focus:outline-none"
                  [attr.aria-label]="'Peso del criterio ' + (ci + 1)"
                />
              </div>
              @if (criteria().length > 1) {
                <button
                  type="button"
                  (click)="removeCriterion(ci)"
                  class="text-muted hover:text-error"
                  [attr.aria-label]="'Eliminar criterio ' + (ci + 1)"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              }
            </div>

            <!-- Levels -->
            <div class="ml-2 space-y-2">
              <p class="text-xs font-medium text-muted">Niveles de logro:</p>
              @for (level of criterion.levels; track $index; let li = $index) {
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    [ngModel]="level.label"
                    (ngModelChange)="updateLevel(ci, li, 'label', $event)"
                    name="level-label-{{ ci }}-{{ li }}"
                    class="w-32 rounded-md border border-border px-2 py-1 text-xs focus:border-primary focus:outline-none"
                    placeholder="Nivel"
                    [attr.aria-label]="'Nivel ' + (li + 1) + ' del criterio ' + (ci + 1)"
                  />
                  <input
                    type="text"
                    [ngModel]="level.description"
                    (ngModelChange)="updateLevel(ci, li, 'description', $event)"
                    name="level-desc-{{ ci }}-{{ li }}"
                    class="flex-1 rounded-md border border-border px-2 py-1 text-xs focus:border-primary focus:outline-none"
                    placeholder="Descripcion del nivel"
                    [attr.aria-label]="'Descripcion del nivel ' + (li + 1)"
                  />
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-muted">Pts:</span>
                    <input
                      type="number"
                      min="0"
                      [ngModel]="level.score"
                      (ngModelChange)="updateLevel(ci, li, 'score', $event)"
                      name="level-score-{{ ci }}-{{ li }}"
                      class="w-14 rounded-md border border-border px-2 py-1 text-xs text-center focus:border-primary focus:outline-none"
                      [attr.aria-label]="'Puntaje del nivel ' + (li + 1)"
                    />
                  </div>
                  @if (criterion.levels.length > 2) {
                    <button
                      type="button"
                      (click)="removeLevel(ci, li)"
                      class="text-muted hover:text-error"
                      [attr.aria-label]="'Eliminar nivel ' + (li + 1)"
                    >
                      <span class="material-symbols-outlined text-base">close</span>
                    </button>
                  }
                </div>
              }
              <button
                type="button"
                (click)="addLevel(ci)"
                class="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <span class="material-symbols-outlined text-base">add</span>
                Agregar nivel
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 border-t border-border pt-4">
        @if (onCancel) {
          <button
            type="button"
            (click)="onCancel?.emit()"
            class="rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-bg"
          >
            Cancelar
          </button>
        }
        <button
          type="submit"
          [disabled]="isLoading() || !title.trim()"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {{ isLoading() ? 'Guardando...' : 'Guardar rubrica' }}
        </button>
      </div>
    </form>
  `,
})
export class RubricBuilderComponent {
  readonly onSave = output<CreateRubricPayload>();
  readonly isLoading = input<boolean>(false);
  readonly onCancel = output<void>();

  title = '';
  description = '';
  criteria = signal<CreateRubricCriterionPayload[]>([createEmptyCriterion(0)]);

  addCriterion(): void {
    this.criteria.update((prev) => [...prev, createEmptyCriterion(prev.length)]);
  }

  removeCriterion(index: number): void {
    this.criteria.update((prev) => prev.filter((_, i) => i !== index));
  }

  updateCriterion(
    index: number,
    field: keyof CreateRubricCriterionPayload,
    value: string | number,
  ): void {
    this.criteria.update((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  updateLevel(
    criterionIndex: number,
    levelIndex: number,
    field: keyof CreateRubricLevelPayload,
    value: string | number,
  ): void {
    this.criteria.update((prev) =>
      prev.map((c, ci) =>
        ci === criterionIndex
          ? {
              ...c,
              levels: c.levels.map((l, li) => (li === levelIndex ? { ...l, [field]: value } : l)),
            }
          : c,
      ),
    );
  }

  addLevel(criterionIndex: number): void {
    this.criteria.update((prev) =>
      prev.map((c, ci) =>
        ci === criterionIndex
          ? {
              ...c,
              levels: [
                ...c.levels,
                {
                  label: '',
                  description: '',
                  score: c.levels.length + 1,
                  orderIndex: c.levels.length,
                },
              ],
            }
          : c,
      ),
    );
  }

  removeLevel(criterionIndex: number, levelIndex: number): void {
    this.criteria.update((prev) =>
      prev.map((c, ci) =>
        ci === criterionIndex ? { ...c, levels: c.levels.filter((_, li) => li !== levelIndex) } : c,
      ),
    );
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    if (!this.title.trim()) return;

    this.onSave.emit({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      criteria: this.criteria().filter((c) => c.name.trim()),
    });
  }
}
