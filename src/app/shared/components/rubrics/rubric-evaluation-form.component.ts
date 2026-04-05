import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

interface RubricLevel {
  id: string;
  label: string;
  description: string;
  score: number;
  orderIndex: number;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  orderIndex: number;
  levels: RubricLevel[];
}

interface Rubric {
  id: string;
  title: string;
  description?: string;
  criteria: RubricCriterion[];
}

interface RubricScoreEntry {
  criterionId: string;
  levelId: string;
  comment?: string;
}

interface CreateRubricEvaluationPayload {
  enrollmentId: string;
  scores: RubricScoreEntry[];
  feedback?: string;
}

@Component({
  selector: 'app-rubric-evaluation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <form (submit)="handleSubmit($event)" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-dark">{{ rubric().title }}</h3>
        <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {{ currentTotal }} / {{ maxTotal }} pts
        </span>
      </div>

      @if (rubric().description) {
        <p class="text-sm text-muted">{{ rubric().description }}</p>
      }

      @for (criterion of sortedCriteria(); track criterion.id; let ci = $index) {
        <div class="rounded-lg border border-border bg-surface p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-dark">
                {{ criterion.name }}
              </h4>
              @if (criterion.description) {
                <p class="text-xs text-muted">{{ criterion.description }}</p>
              }
            </div>
            <span class="text-xs text-muted"> Peso: {{ criterion.weight }}x </span>
          </div>

          <!-- Level selection -->
          <div class="grid gap-2">
            @for (level of sortedLevels(criterion); track level.id) {
              <button
                type="button"
                (click)="selectLevel(criterion.id, level.id)"
                class="flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors"
                [class.border-primary]="isSelected(criterion.id, level.id)"
                [class.bg-primary-light]="isSelected(criterion.id, level.id)"
                [class.text-primary]="isSelected(criterion.id, level.id)"
                [class.border-border]="!isSelected(criterion.id, level.id)"
                [class.hover:border-primary/30]="!isSelected(criterion.id, level.id)"
                [class.hover:bg-bg]="!isSelected(criterion.id, level.id)"
                [attr.aria-pressed]="isSelected(criterion.id, level.id)"
                [attr.aria-label]="level.label + ': ' + level.score + ' puntos'"
              >
                <div class="flex items-center gap-2">
                  <app-icon
                    [name]="
                      isSelected(criterion.id, level.id)
                        ? 'radio_button_checked'
                        : 'radio_button_unchecked'
                    "
                    [size]="18"
                  ></app-icon>
                  <div>
                    <span class="font-medium">{{ level.label }}</span>
                    @if (level.description) {
                      <p class="text-xs text-muted">
                        {{ level.description }}
                      </p>
                    }
                  </div>
                </div>
                <span class="text-xs font-medium"> {{ level.score }} pts </span>
              </button>
            }
          </div>

          <!-- Optional comment -->
          <input
            type="text"
            [ngModel]="getComment(criterion.id)"
            (ngModelChange)="updateComment(criterion.id, $event)"
            name="comment-{{ criterion.id }}"
            class="w-full rounded-md border border-border px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
            placeholder="Comentario para este criterio (opcional)"
            [attr.aria-label]="'Comentario para ' + criterion.name"
          />
        </div>
      }

      <!-- General Feedback -->
      <div>
        <label for="eval-feedback" class="block text-sm font-medium text-dark">
          Retroalimentacion general (opcional)
        </label>
        <textarea
          id="eval-feedback"
          [(ngModel)]="feedback"
          name="feedback"
          rows="3"
          class="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          placeholder="Comentarios generales sobre el desempeno del estudiante..."
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          [disabled]="isLoading() || !allCriteriaScored"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {{ isLoading() ? 'Guardando...' : 'Guardar evaluacion' }}
        </button>
      </div>
    </form>
  `,
})
export class RubricEvaluationFormComponent {
  readonly rubric = input.required<Rubric>();
  readonly enrollmentId = input<string>('');
  readonly onSubmit = output<CreateRubricEvaluationPayload>();
  readonly isLoading = input<boolean>(false);
  readonly initialScores = input<RubricScoreEntry[]>([]);
  readonly initialFeedback = input<string>('');

  scores = signal<Record<string, { levelId: string; comment: string }>>({});
  feedback = '';

  constructor() {
    this.feedback = this.initialFeedback();

    effect(
      () => {
        const initial = this.initialScores();
        if (initial && initial.length > 0) {
          const scoreMap: Record<string, { levelId: string; comment: string }> = {};
          for (const s of initial) {
            scoreMap[s.criterionId] = {
              levelId: s.levelId,
              comment: s.comment ?? '',
            };
          }
          this.scores.set(scoreMap);
        }
      },
      { allowSignalWrites: true },
    );
  }

  sortedCriteria(): RubricCriterion[] {
    return [...this.rubric().criteria].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  sortedLevels(criterion: RubricCriterion): RubricLevel[] {
    return [...criterion.levels].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  isSelected(criterionId: string, levelId: string): boolean {
    return this.scores()[criterionId]?.levelId === levelId;
  }

  getComment(criterionId: string): string {
    return this.scores()[criterionId]?.comment ?? '';
  }

  selectLevel(criterionId: string, levelId: string): void {
    this.scores.update((prev) => ({
      ...prev,
      [criterionId]: {
        levelId,
        comment: prev[criterionId]?.comment ?? '',
      },
    }));
  }

  updateComment(criterionId: string, comment: string): void {
    this.scores.update((prev) => ({
      ...prev,
      [criterionId]: {
        levelId: prev[criterionId]?.levelId ?? '',
        comment,
      },
    }));
  }

  get allCriteriaScored(): boolean {
    return this.rubric().criteria.every((c) => this.scores()[c.id]?.levelId);
  }

  get currentTotal(): number {
    let total = 0;
    for (const criterion of this.rubric().criteria) {
      const selectedLevelId = this.scores()[criterion.id]?.levelId;
      const selectedLevel = criterion.levels.find((l) => l.id === selectedLevelId);
      if (selectedLevel) {
        total += selectedLevel.score * criterion.weight;
      }
    }
    return total;
  }

  get maxTotal(): number {
    let max = 0;
    for (const criterion of this.rubric().criteria) {
      const maxLevel = criterion.levels.reduce(
        (maxLevel, l) => (l.score > maxLevel.score ? l : maxLevel),
        criterion.levels[0]!,
      );
      max += maxLevel.score * criterion.weight;
    }
    return max;
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    if (!this.allCriteriaScored) return;

    const scoreEntries: RubricScoreEntry[] = this.rubric().criteria.map((c) => ({
      criterionId: c.id,
      levelId: this.scores()[c.id]!.levelId,
      comment: this.scores()[c.id]!.comment || undefined,
    }));

    this.onSubmit.emit({
      enrollmentId: this.enrollmentId(),
      scores: scoreEntries,
      feedback: this.feedback.trim() || undefined,
    });
  }
}
