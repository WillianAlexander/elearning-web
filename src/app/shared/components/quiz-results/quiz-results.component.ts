import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizBlockContent, QuizQuestion } from '../quiz-viewer/quiz-viewer.component';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Score header -->
      <div class="flex items-center gap-4">
        <div
          class="rounded-full px-4 py-2 text-lg font-bold"
          [class.bg-primary/10]="attempt().passed"
          [class.text-primary]="attempt().passed"
          [class.bg-red-100]="!attempt().passed"
          [class.text-red-700]="!attempt().passed"
        >
          {{ attempt().score }}%
        </div>
        <div>
          <p class="font-semibold">
            {{ attempt().passed ? 'Aprobado' : 'No aprobado' }}
          </p>
          <p class="text-sm text-muted">
            {{ attempt().correctCount }} de {{ attempt().totalQuestions }} correctas
          </p>
        </div>
      </div>

      <!-- Questions review -->
      <div class="space-y-3">
        @for (question of quizContent().questions; track question.id; let index = $index) {
          @let answer = attempt().answers.find(a => a.questionId === question.id);
          @let isCorrect = answer?.isCorrect ?? false;
          @let qType = getQuestionType(question);

          <div
            class="rounded-lg border p-4"
            [class.border-primary-muted]="isCorrect"
            [class.bg-primary/5]="isCorrect"
            [class.border-red-200]="!isCorrect"
            [class.bg-red-50]="!isCorrect"
          >
            <p class="font-medium text-dark">{{ index + 1 }}. {{ question.text }}</p>

            <!-- Multiple choice review -->
            @if (qType === 'multiple_choice') {
              <div class="mt-2 space-y-1">
                @for (opt of question.options; track opt.id) {
                  @let isSelected = answer?.selectedOptionId === opt.id;
                  @let isCorrectOption = question.correctOptionId === opt.id;

                  <div
                    class="flex items-center gap-2 rounded px-2 py-1 text-sm"
                    [class.font-medium]="isCorrectOption"
                    [class.text-primary]="isCorrectOption"
                    [class.text-red-600]="isSelected && !isCorrect"
                    [class.line-through]="isSelected && !isCorrect"
                    [class.text-muted]="!isCorrectOption && !isSelected"
                  >
                    <span>{{ isCorrectOption ? '✓' : isSelected ? '✗' : '○' }}</span>
                    <span>{{ opt.text }}</span>
                  </div>
                }
              </div>
            }

            <!-- Multiple select review -->
            @if (qType === 'multiple_select') {
              <div class="mt-2 space-y-1">
                @for (opt of question.options; track opt.id) {
                  @let isSelected = answer?.selectedOptionIds?.includes(opt.id) ?? false;
                  @let isCorrectOption = question.correctOptionIds?.includes(opt.id) ?? false;

                  <div
                    class="flex items-center gap-2 rounded px-2 py-1 text-sm"
                    [class.font-medium]="isCorrectOption"
                    [class.text-primary]="isCorrectOption && isSelected"
                    [class.text-primary/60]="isCorrectOption && !isSelected"
                    [class.text-red-600]="!isCorrectOption && isSelected"
                    [class.line-through]="!isCorrectOption && isSelected"
                    [class.text-muted]="!isCorrectOption && !isSelected"
                  >
                    <span>{{ isCorrectOption ? '✓' : isSelected ? '✗' : '○' }}</span>
                    <span>{{ opt.text }}</span>
                    @if (isCorrectOption && !isSelected) {
                      <span class="text-[10px] text-muted">(debía seleccionarse)</span>
                    }
                  </div>
                }
              </div>
            }

            <!-- True/False review -->
            @if (qType === 'true_false') {
              <div class="mt-2 flex gap-3">
                @for (val of ['true', 'false']; track val) {
                  @let isSelected = answer?.selectedOptionId === val;
                  @let isCorrectOption = String(question.correctAnswer) === val;

                  <div
                    class="flex-1 rounded-md border px-3 py-1.5 text-center text-sm"
                    [class.border-primary]="isCorrectOption"
                    [class.font-medium]="isCorrectOption"
                    [class.text-primary]="isCorrectOption"
                    [class.border-red-400]="isSelected && !isCorrectOption"
                    [class.text-red-600]="isSelected && !isCorrectOption"
                    [class.line-through]="isSelected && !isCorrectOption"
                    [class.border-border]="!isCorrectOption && !isSelected"
                    [class.text-muted]="!isCorrectOption && !isSelected"
                  >
                    {{ isCorrectOption ? '✓ ' : isSelected ? '✗ ' : ''
                    }}{{ val === 'true' ? 'Verdadero' : 'Falso' }}
                  </div>
                }
              </div>
            }

            @if (question.explanation) {
              <p class="mt-2 text-sm text-muted">
                <span class="font-medium">Explicación:</span> {{ question.explanation }}
              </p>
            }
          </div>
        }
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
export class QuizResultsComponent {
  readonly attempt = input.required<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    answers: {
      questionId: string;
      isCorrect: boolean;
      selectedOptionId?: string;
      selectedOptionIds?: string[];
    }[];
  }>();
  readonly quizContent = input.required<QuizBlockContent>();

  getQuestionType(q: QuizQuestion): string {
    return 'type' in q && q.type ? q.type : 'multiple_choice';
  }
}
