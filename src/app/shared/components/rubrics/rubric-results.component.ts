import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface RubricScoreEntry {
  criterionId: string;
  levelId: string;
  comment?: string;
}

interface RubricEvaluationResult {
  id: string;
  enrollmentId: string;
  rubricId: string;
  totalScore: number;
  maxScore: number;
  feedback?: string;
  evaluator?: User;
  scores: RubricScoreEntry[];
  createdAt: string;
}

@Component({
  selector: 'app-rubric-results',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between rounded-lg bg-surface p-4 border border-border">
        <div>
          <h3 class="text-lg font-bold text-dark">{{ rubric().title }}</h3>
          @if (evaluation().evaluator) {
            <p class="text-xs text-muted">
              Evaluado por {{ evaluation().evaluator!.firstName }}
              {{ evaluation().evaluator!.lastName }}
            </p>
          }
        </div>
        <div class="text-right">
          <p [class]="'text-2xl font-bold ' + getScoreColor(percentage())">{{ percentage() }}%</p>
          <p class="text-xs text-muted">
            {{ evaluation().totalScore }} / {{ evaluation().maxScore }} pts
          </p>
        </div>
      </div>

      <!-- Criteria Results -->
      @for (criterion of sortedCriteria(); track criterion.id) {
        <div class="rounded-lg border border-border p-3 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-dark">
                {{ criterion.name }}
              </h4>
              @if (criterion.description) {
                <p class="text-xs text-muted">{{ criterion.description }}</p>
              }
            </div>
            <span class="text-sm font-medium">
              {{ getScoreEntry(criterion.id)?.levelId ? getSelectedLevelScore(criterion) : 0 }} /
              {{ getMaxLevelScore(criterion) }}
            </span>
          </div>

          @if (getSelectedLevel(criterion)) {
            <div class="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5">
              <app-icon name="check_circle" [size]="16" className="text-primary"></app-icon>
              <span class="text-sm font-medium text-primary">
                {{ getSelectedLevel(criterion)!.label }}
              </span>
              @if (getSelectedLevel(criterion)!.description) {
                <span class="text-xs text-muted">
                  — {{ getSelectedLevel(criterion)!.description }}
                </span>
              }
            </div>
          }

          @if (getScoreEntry(criterion.id)?.comment) {
            <p class="text-xs text-muted italic pl-6">
              {{ getScoreEntry(criterion.id)!.comment }}
            </p>
          }
        </div>
      }

      <!-- General Feedback -->
      @if (evaluation().feedback) {
        <div class="rounded-lg bg-secondary/5 border border-secondary/20 p-4">
          <h4 class="text-sm font-medium text-dark mb-1">
            <app-icon name="feedback" [size]="16" className="mr-1 inline"></app-icon>
            Retroalimentacion general
          </h4>
          <p class="text-sm text-muted">{{ evaluation().feedback }}</p>
        </div>
      }
    </div>
  `,
})
export class RubricResultsComponent {
  readonly evaluation = input.required<RubricEvaluationResult>();
  readonly rubric = input.required<Rubric>();

  sortedCriteria(): RubricCriterion[] {
    return [...this.rubric().criteria].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  percentage(): number {
    return this.evaluation().maxScore > 0
      ? Math.round((this.evaluation().totalScore / this.evaluation().maxScore) * 100)
      : 0;
  }

  getScoreColor(pct: number): string {
    if (pct >= 80) return 'text-accent';
    if (pct >= 60) return 'text-secondary';
    return 'text-error';
  }

  getScoreEntry(criterionId: string): RubricScoreEntry | undefined {
    return this.evaluation().scores.find((s) => s.criterionId === criterionId);
  }

  getSelectedLevel(criterion: RubricCriterion): RubricLevel | undefined {
    const scoreEntry = this.getScoreEntry(criterion.id);
    return criterion.levels.find((l) => l.id === scoreEntry?.levelId);
  }

  getSelectedLevelScore(criterion: RubricCriterion): number {
    const selected = this.getSelectedLevel(criterion);
    return selected?.score ?? 0;
  }

  getMaxLevelScore(criterion: RubricCriterion): number {
    const maxLevel = criterion.levels.reduce(
      (max, l) => (l.score > max.score ? l : max),
      criterion.levels[0]!,
    );
    return maxLevel.score;
  }
}
