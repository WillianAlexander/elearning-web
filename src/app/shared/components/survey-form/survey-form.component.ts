import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text';
  required: boolean;
}

interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveyAnswer {
  questionId: string;
  value: string | number;
}

interface SubmitSurveyPayload {
  templateId: string;
  enrollmentId: string;
  answers: SurveyAnswer[];
}

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  template: `
    <form (submit)="handleSubmit($event)" class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-on-surface">{{ template().title }}</h3>
        @if (template().description) {
          <p class="mt-1 text-sm text-muted">{{ template().description }}</p>
        }
      </div>

      @for (question of template().questions; track question.id) {
        <div class="space-y-2">
          <label class="block text-sm font-medium text-on-surface">
            {{ question.text }}
            @if (question.required) {
              <span class="ml-1 text-red-500" aria-label="requerido">*</span>
            }
          </label>

          @if (question.type === 'rating') {
            <app-star-rating
              [value]="getAnswerValue(question.id) as number"
              [interactive]="true"
              (ratingChange)="updateAnswer(question.id, $event)"
              size="lg"
            ></app-star-rating>
          } @else {
            <textarea
              [ngModel]="getAnswerValue(question.id)"
              (ngModelChange)="updateAnswer(question.id, $event)"
              name="answer-{{ question.id }}"
              rows="3"
              placeholder="Escribe tu respuesta..."
              class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
              [required]="question.required"
            ></textarea>
          }
        </div>
      }

      <button
        type="submit"
        [disabled]="isLoading()"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {{ isLoading() ? 'Enviando...' : 'Enviar encuesta' }}
      </button>
    </form>
  `,
})
export class SurveyFormComponent {
  readonly template = input.required<SurveyTemplate>();
  readonly enrollmentId = input<string>('');
  readonly onSuccess = output<void>();
  readonly isLoading = input<boolean>(false);

  answers = signal<Record<string, string | number>>({});

  updateAnswer(questionId: string, value: string | number): void {
    this.answers.update((prev) => ({ ...prev, [questionId]: value }));
  }

  getAnswerValue(questionId: string): string | number {
    return this.answers()[questionId] ?? '';
  }

  handleSubmit(e: Event): void {
    e.preventDefault();

    const unanswered = this.template()
      .questions.filter((q) => q.required && !this.answers()[q.id])
      .map((q) => q.text);

    if (unanswered.length > 0) return;

    const formattedAnswers: SurveyAnswer[] = this.template()
      .questions.filter((q) => this.answers()[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        value: this.answers()[q.id]!,
      }));

    const payload: SubmitSurveyPayload = {
      templateId: this.template().id,
      enrollmentId: this.enrollmentId(),
      answers: formattedAnswers,
    };

    // Emit the payload for parent to handle
    // In a real app, this would call a service
    console.log('Survey submitted:', payload);
    this.onSuccess.emit();
  }
}
