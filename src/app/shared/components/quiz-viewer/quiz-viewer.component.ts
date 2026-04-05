import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false';
  options?: QuizOption[];
  correctOptionId?: string;
  correctOptionIds?: string[];
  correctAnswer?: boolean;
  explanation?: string;
}

export interface QuizBlockContent {
  questions: QuizQuestion[];
  maxAttempts?: number | null;
  passingScore?: number;
}

@Component({
  selector: 'app-quiz-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @switch (state()) {
      @case ('idle') {
        <div class="rounded-lg border border-border bg-bg p-6">
          <h4 class="text-lg font-semibold text-dark">Quiz</h4>
          <p class="mt-1 text-sm text-muted">
            {{ content().questions.length }} pregunta{{
              content().questions.length !== 1 ? 's' : ''
            }}
            &middot; Puntaje mínimo: {{ passingScore() }}%
          </p>

          @if (summary()) {
            <div class="mt-3 rounded-md bg-surface p-3 text-sm">
              <p>
                Mejor puntaje:
                <span
                  [class]="
                    summary()!.passed ? 'font-bold text-green-600' : 'font-bold text-red-600'
                  "
                >
                  {{ summary()!.bestScore }}%
                </span>
              </p>
              <p class="text-muted">
                Intentos: {{ summary()!.totalAttempts }}
                @if (summary()!.maxAttempts !== null) {
                  {{ ' / ' + summary()!.maxAttempts }}
                }
              </p>
            </div>
          }

          @if (!summary() || summary()!.canRetry) {
            <button
              type="button"
              (click)="startQuiz()"
              class="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {{ summary() && summary()!.totalAttempts > 0 ? 'Reintentar quiz' : 'Iniciar quiz' }}
            </button>
          }

          @if (summary() && !summary()!.canRetry) {
            <p class="mt-4 text-sm font-medium text-muted">
              {{
                summary()!.passed
                  ? 'Ya aprobaste este quiz.'
                  : 'Has alcanzado el máximo de intentos.'
              }}
            </p>
          }
        </div>
      }
      @case ('taking') {
        <div class="rounded-lg border border-primary-muted bg-primary/5 p-6">
          <h4 class="text-lg font-semibold text-dark">Quiz en progreso</h4>

          <div class="mt-4 space-y-6">
            @for (question of content().questions; track question.id; let qIndex = $index) {
              <div class="rounded-lg bg-surface p-4 shadow-sm">
                <p class="font-medium text-dark">{{ qIndex + 1 }}. {{ question.text }}</p>

                @if (question.type === 'multiple_select') {
                  <p class="mt-1 text-xs text-muted">Selecciona todas las opciones correctas.</p>
                }

                <!-- Multiple choice (radio) -->
                @if (question.type === 'multiple_choice' && question.options) {
                  <div class="mt-3 space-y-2">
                    @for (opt of question.options; track opt.id) {
                      <label
                        class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors"
                        [class.border-primary]="selectedAnswers().get(question.id) === opt.id"
                        [class.bg-primary/10]="selectedAnswers().get(question.id) === opt.id"
                        [class.border-border]="selectedAnswers().get(question.id) !== opt.id"
                        [class.hover:bg-primary/5]="selectedAnswers().get(question.id) !== opt.id"
                      >
                        <input
                          type="radio"
                          [name]="'quiz-' + question.id"
                          [checked]="selectedAnswers().get(question.id) === opt.id"
                          (change)="selectOption(question.id, opt.id)"
                          class="h-4 w-4 text-primary"
                        />
                        <span>{{ opt.text }}</span>
                      </label>
                    }
                  </div>
                }

                <!-- Multiple select (checkboxes) -->
                @if (question.type === 'multiple_select' && question.options) {
                  <div class="mt-3 space-y-2">
                    @for (opt of question.options; track opt.id) {
                      <label
                        class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors"
                        [class.border-primary]="multiSelections().get(question.id)?.has(opt.id)"
                        [class.bg-primary/10]="multiSelections().get(question.id)?.has(opt.id)"
                        [class.border-border]="!multiSelections().get(question.id)?.has(opt.id)"
                        [class.hover:bg-primary/5]="
                          !multiSelections().get(question.id)?.has(opt.id)
                        "
                      >
                        <input
                          type="checkbox"
                          [checked]="multiSelections().get(question.id)?.has(opt.id)"
                          (change)="toggleMultiOption(question.id, opt.id)"
                          class="h-4 w-4 rounded text-primary"
                        />
                        <span>{{ opt.text }}</span>
                      </label>
                    }
                  </div>
                }

                <!-- True / False -->
                @if (question.type === 'true_false') {
                  <div class="mt-3 flex gap-3">
                    @for (val of ['true', 'false']; track val) {
                      <button
                        type="button"
                        (click)="selectOption(question.id, val)"
                        class="flex-1 rounded-md border py-2 text-sm font-medium transition-colors"
                        [class.border-primary]="selectedAnswers().get(question.id) === val"
                        [class.bg-primary/10]="selectedAnswers().get(question.id) === val"
                        [class.text-primary]="selectedAnswers().get(question.id) === val"
                        [class.border-border]="selectedAnswers().get(question.id) !== val"
                        [class.text-muted]="selectedAnswers().get(question.id) !== val"
                        [class.hover:bg-primary/5]="selectedAnswers().get(question.id) !== val"
                      >
                        {{ val === 'true' ? 'Verdadero' : 'Falso' }}
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              (click)="submitQuiz()"
              class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Enviar respuestas
            </button>
            <button
              type="button"
              (click)="state.set('idle')"
              class="rounded-lg border border-border px-6 py-2 text-sm text-muted hover:bg-primary/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      }
      @case ('reviewing') {
        <div class="rounded-lg border border-border p-6">
          <div class="mb-4 flex items-center justify-between">
            <h4 class="text-lg font-semibold text-dark">Resultados del quiz</h4>
            <button
              type="button"
              (click)="state.set('idle')"
              class="text-sm text-primary hover:text-primary/80"
            >
              Volver al resumen
            </button>
          </div>
          <app-quiz-results [attempt]="lastAttempt()" [quizContent]="content()" />
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class QuizViewerComponent {
  readonly content = input.required<QuizBlockContent>();

  readonly quizSubmitted =
    output<{ questionId: string; selectedOptionId: string; selectedOptionIds?: string[] }[]>();

  state = signal<'idle' | 'taking' | 'reviewing'>('idle');
  selectedAnswers = signal<Map<string, string>>(new Map());
  multiSelections = signal<Map<string, Set<string>>>(new Map());
  lastAttempt = signal<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    answers: { questionId: string; isCorrect: boolean }[];
  } | null>(null);
  summary = signal<{
    bestScore: number;
    passed: boolean;
    totalAttempts: number;
    maxAttempts: number | null;
    canRetry: boolean;
  } | null>(null);

  passingScore = computed(() => this.content().passingScore ?? 70);

  startQuiz(): void {
    this.selectedAnswers.set(new Map());
    this.multiSelections.set(new Map());
    this.lastAttempt.set(null);
    this.state.set('taking');
  }

  selectOption(questionId: string, optionId: string): void {
    this.selectedAnswers.update((prev) => {
      const next = new Map(prev);
      next.set(questionId, optionId);
      return next;
    });
  }

  toggleMultiOption(questionId: string, optionId: string): void {
    this.multiSelections.update((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId) ?? new Set<string>();
      const updated = new Set(current);
      if (updated.has(optionId)) {
        updated.delete(optionId);
      } else {
        updated.add(optionId);
      }
      next.set(questionId, updated);
      return next;
    });
  }

  submitQuiz(): void {
    const unanswered = this.content().questions.filter((q) => {
      if (q.type === 'multiple_select') {
        return (this.multiSelections().get(q.id)?.size ?? 0) === 0;
      }
      return !this.selectedAnswers().has(q.id);
    });

    if (unanswered.length > 0) {
      alert(`Faltan ${unanswered.length} pregunta(s) por responder`);
      return;
    }

    const answers = this.content().questions.map((q) => {
      if (q.type === 'multiple_select') {
        const selected = [...(this.multiSelections().get(q.id) ?? new Set<string>())];
        return {
          questionId: q.id,
          selectedOptionId: '',
          selectedOptionIds: selected,
        };
      }
      return {
        questionId: q.id,
        selectedOptionId: this.selectedAnswers().get(q.id) ?? '',
      };
    });

    // Calculate score
    let correctCount = 0;
    const answerResults = this.content().questions.map((q) => {
      let isCorrect = false;
      if (q.type === 'multiple_select') {
        const selected = new Set(this.multiSelections().get(q.id) ?? []);
        const correct = new Set(q.correctOptionIds ?? []);
        isCorrect = selected.size === correct.size && [...selected].every((s) => correct.has(s));
      } else if (q.type === 'true_false') {
        isCorrect = this.selectedAnswers().get(q.id) === String(q.correctAnswer);
      } else {
        isCorrect = this.selectedAnswers().get(q.id) === q.correctOptionId;
      }
      if (isCorrect) correctCount++;
      return { questionId: q.id, isCorrect };
    });

    const totalQuestions = this.content().questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= this.passingScore();

    this.lastAttempt.set({
      score,
      passed,
      correctCount,
      totalQuestions,
      answers: answerResults,
    });

    this.summary.set({
      bestScore: score,
      passed,
      totalAttempts: (this.summary()?.totalAttempts ?? 0) + 1,
      maxAttempts: this.content().maxAttempts ?? null,
      canRetry:
        passed ||
        (this.content().maxAttempts
          ? (this.summary()?.totalAttempts ?? 0) + 1 < this.content().maxAttempts!
          : true),
    });

    this.state.set('reviewing');
    this.quizSubmitted.emit(answers);
  }
}
