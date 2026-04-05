import { Component, input, output, signal } from '@angular/core';
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
  selector: 'app-quiz-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (editMode()) {
      <div class="rounded-md border border-border bg-gray-50 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-dark">
            Quiz ({{ content().questions.length }} pregunta{{
              content().questions.length !== 1 ? 's' : ''
            }})
          </h4>
          <div class="flex items-center gap-2">
            <details class="relative">
              <summary
                class="cursor-pointer list-none rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
              >
                + Pregunta
              </summary>
              <div
                class="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-border bg-surface shadow-md"
              >
                @for (entry of questionTypeEntries; track entry[0]) {
                  <button
                    type="button"
                    (click)="addQuestion(entry[0] as any)"
                    class="block w-full px-3 py-2 text-left text-xs text-dark hover:bg-gray-50"
                  >
                    {{ entry[1] }}
                  </button>
                }
              </div>
            </details>
          </div>
        </div>

        <!-- Quiz settings -->
        <div class="mb-3 flex gap-4">
          <div>
            <label class="text-xs font-medium text-muted">Puntaje mínimo (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              [value]="passingScore()"
              (input)="onPassingScoreChange($event)"
              class="mt-1 w-20 rounded-md border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-muted">Max intentos (vacío = ilimitado)</label>
            <input
              type="number"
              min="1"
              [value]="maxAttempts()"
              (input)="onMaxAttemptsChange($event)"
              placeholder="∞"
              class="mt-1 w-20 rounded-md border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        @if (content().questions.length === 0) {
          <p class="py-4 text-center text-xs text-muted/60">Agrega preguntas al quiz</p>
        }

        <div class="space-y-3">
          @for (question of content().questions; track question.id; let qIndex = $index) {
            <div class="rounded-md border border-border bg-surface">
              <!-- Question header -->
              <div class="flex items-center gap-2 border-b border-border/50 px-3 py-2">
                <button
                  type="button"
                  (click)="toggleExpand(question.id)"
                  class="text-xs font-medium text-dark"
                >
                  Pregunta {{ qIndex + 1 }}
                </button>
                <span class="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-muted">
                  {{ getQuestionTypeLabel(question.type) }}
                </span>
                <div class="flex-1"></div>
                <button
                  type="button"
                  (click)="removeQuestion(question.id)"
                  class="text-xs text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>

              <!-- Question body (expanded) -->
              @if (expandedId() === question.id) {
                <div class="space-y-3 p-3">
                  <!-- Question text -->
                  <div>
                    <label class="text-xs font-medium text-muted">Pregunta</label>
                    <input
                      type="text"
                      [value]="question.text"
                      (input)="updateQuestionText(question.id, $event)"
                      placeholder="Escribe la pregunta..."
                      class="mt-1 w-full rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <!-- Multiple choice options -->
                  @if (question.type === 'multiple_choice') {
                    <div>
                      <label class="text-xs font-medium text-muted"
                        >Opciones (selecciona la correcta)</label
                      >
                      <div class="mt-1 space-y-2">
                        @for (opt of question.options; track opt.id) {
                          <div class="flex items-center gap-2">
                            <input
                              type="radio"
                              [name]="'correct-' + question.id"
                              [checked]="question.correctOptionId === opt.id"
                              (change)="setCorrectOption(question.id, opt.id)"
                              class="h-4 w-4 text-primary"
                            />
                            <input
                              type="text"
                              [value]="opt.text"
                              (input)="updateOptionText(question.id, opt.id, $event)"
                              placeholder="Opción..."
                              class="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            />
                            @if (question.options && question.options.length > 2) {
                              <button
                                type="button"
                                (click)="removeOption(question.id, opt.id)"
                                class="text-muted hover:text-red-600"
                              >
                                <span class="material-symbols-outlined text-sm">close</span>
                              </button>
                            }
                          </div>
                        }
                      </div>
                      <button
                        type="button"
                        (click)="addOption(question.id)"
                        class="mt-2 text-xs text-primary hover:text-primary/80"
                      >
                        + Agregar opción
                      </button>
                    </div>
                  }

                  <!-- Multiple select options -->
                  @if (question.type === 'multiple_select') {
                    <div>
                      <label class="text-xs font-medium text-muted"
                        >Opciones (marca todas las correctas)</label
                      >
                      <div class="mt-1 space-y-2">
                        @for (opt of question.options; track opt.id) {
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              [checked]="question.correctOptionIds?.includes(opt.id)"
                              (change)="toggleCorrectOption(question.id, opt.id)"
                              class="h-4 w-4 rounded text-primary"
                            />
                            <input
                              type="text"
                              [value]="opt.text"
                              (input)="updateOptionText(question.id, opt.id, $event)"
                              placeholder="Opción..."
                              class="flex-1 rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                        }
                      </div>
                      <button
                        type="button"
                        (click)="addOption(question.id)"
                        class="mt-2 text-xs text-primary hover:text-primary/80"
                      >
                        + Agregar opción
                      </button>
                    </div>
                  }

                  <!-- True/False answer selector -->
                  @if (question.type === 'true_false') {
                    <div>
                      <label class="text-xs font-medium text-muted">Respuesta correcta</label>
                      <div class="mt-2 flex gap-3">
                        <button
                          type="button"
                          (click)="setTrueFalseAnswer(question.id, true)"
                          class="rounded-md border px-4 py-1.5 text-sm font-medium transition-colors"
                          [class.border-primary]="question.correctAnswer === true"
                          [class.bg-primary/10]="question.correctAnswer === true"
                          [class.text-primary]="question.correctAnswer === true"
                          [class.border-border]="question.correctAnswer !== true"
                          [class.text-muted]="question.correctAnswer !== true"
                        >
                          Verdadero
                        </button>
                        <button
                          type="button"
                          (click)="setTrueFalseAnswer(question.id, false)"
                          class="rounded-md border px-4 py-1.5 text-sm font-medium transition-colors"
                          [class.border-primary]="question.correctAnswer === false"
                          [class.bg-primary/10]="question.correctAnswer === false"
                          [class.text-primary]="question.correctAnswer === false"
                          [class.border-border]="question.correctAnswer !== false"
                          [class.text-muted]="question.correctAnswer !== false"
                        >
                          Falso
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Explanation -->
                  <div>
                    <label class="text-xs font-medium text-muted">Explicación (opcional)</label>
                    <textarea
                      [value]="question.explanation || ''"
                      (input)="updateExplanation(question.id, $event)"
                      placeholder="Explica por qué es la respuesta correcta..."
                      rows="2"
                      class="mt-1 w-full rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- View mode - show quiz viewer -->
      <div class="rounded-lg border border-border bg-gray-50 p-4">
        <p class="text-sm text-muted">Quiz: {{ content().questions.length }} preguntas</p>
      </div>
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
export class QuizBlockComponent {
  readonly content = input.required<QuizBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  expandedId = signal<string | null>(null);
  questionTypeEntries: [string, string][] = [
    ['multiple_choice', 'Opción múltiple'],
    ['multiple_select', 'Selección múltiple'],
    ['true_false', 'Verdadero / Falso'],
  ];

  passingScore = signal(70);
  maxAttempts = signal<number | null>(null);

  ngOnInit(): void {
    this.passingScore.set(this.content().passingScore ?? 70);
    this.maxAttempts.set(this.content().maxAttempts ?? null);
  }

  getQuestionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      multiple_choice: 'Opción múltiple',
      multiple_select: 'Selección múltiple',
      true_false: 'Verdadero / Falso',
    };
    return labels[type] || type;
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  addQuestion(type: string): void {
    let newQ: QuizQuestion;
    const id = Math.random().toString(36).substring(2, 9);

    if (type === 'multiple_select') {
      const optA = Math.random().toString(36).substring(2, 9);
      const optB = Math.random().toString(36).substring(2, 9);
      newQ = {
        id,
        type: 'multiple_select',
        text: '',
        options: [
          { id: optA, text: '' },
          { id: optB, text: '' },
        ],
        correctOptionIds: [optA],
        explanation: '',
      };
    } else if (type === 'true_false') {
      newQ = {
        id,
        type: 'true_false',
        text: '',
        correctAnswer: true,
        explanation: '',
      };
    } else {
      const optionA = Math.random().toString(36).substring(2, 9);
      newQ = {
        id,
        type: 'multiple_choice',
        text: '',
        options: [
          { id: optionA, text: '' },
          { id: Math.random().toString(36).substring(2, 9), text: '' },
        ],
        correctOptionId: optionA,
        explanation: '',
      };
    }

    const updated = [...this.content().questions, newQ];
    this.contentUpdate.emit({
      ...this.content(),
      questions: updated,
      passingScore: this.passingScore(),
      maxAttempts: this.maxAttempts(),
    });
    this.expandedId.set(newQ.id);
  }

  removeQuestion(qId: string): void {
    const updated = this.content().questions.filter((q: QuizQuestion) => q.id !== qId);
    this.contentUpdate.emit({
      ...this.content(),
      questions: updated,
      passingScore: this.passingScore(),
      maxAttempts: this.maxAttempts(),
    });
  }

  updateQuestionText(qId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const updated = this.content().questions.map((q: QuizQuestion) =>
      q.id === qId ? { ...q, text: value } : q,
    );
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  updateOptionText(qId: string, optId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const updated = this.content().questions.map((q: QuizQuestion) => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options?.map((o: QuizOption) => (o.id === optId ? { ...o, text: value } : o)),
      };
    });
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  addOption(qId: string): void {
    const updated = this.content().questions.map((q: QuizQuestion) => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: [
          ...(q.options || []),
          { id: Math.random().toString(36).substring(2, 9), text: '' },
        ],
      };
    });
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  removeOption(qId: string, optId: string): void {
    const updated = this.content().questions.map((q: QuizQuestion) => {
      if (q.id !== qId) return q;
      const newOptions = q.options?.filter((o: QuizOption) => o.id !== optId) || [];
      return { ...q, options: newOptions };
    });
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  setCorrectOption(qId: string, optId: string): void {
    const updated = this.content().questions.map((q: QuizQuestion) =>
      q.id === qId ? { ...q, correctOptionId: optId } : q,
    );
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  toggleCorrectOption(qId: string, optId: string): void {
    const updated = this.content().questions.map((q: QuizQuestion) => {
      if (q.id !== qId) return q;
      const current = q.correctOptionIds || [];
      const has = current.includes(optId);
      const next = has ? current.filter((id: string) => id !== optId) : [...current, optId];
      return next.length > 0 ? { ...q, correctOptionIds: next } : q;
    });
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  setTrueFalseAnswer(qId: string, answer: boolean): void {
    const updated = this.content().questions.map((q: QuizQuestion) =>
      q.id === qId ? { ...q, correctAnswer: answer } : q,
    );
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  updateExplanation(qId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    const updated = this.content().questions.map((q: QuizQuestion) =>
      q.id === qId ? { ...q, explanation: value } : q,
    );
    this.contentUpdate.emit({ ...this.content(), questions: updated });
  }

  onPassingScoreChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10) || 70;
    this.passingScore.set(value);
    this.contentUpdate.emit({
      ...this.content(),
      passingScore: value,
      maxAttempts: this.maxAttempts(),
    });
  }

  onMaxAttemptsChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const num = value ? parseInt(value, 10) : null;
    this.maxAttempts.set(num);
    this.contentUpdate.emit({
      ...this.content(),
      passingScore: this.passingScore(),
      maxAttempts: num,
    });
  }
}
