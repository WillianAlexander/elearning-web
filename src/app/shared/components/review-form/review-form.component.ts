import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-dark mb-1"> Tu calificación </label>
        <app-star-rating
          [value]="rating()"
          [interactive]="true"
          (ratingChange)="rating.set($event)"
          size="md"
        />
      </div>

      <div>
        <label for="review-comment" class="block text-sm font-medium text-dark mb-1">
          Comentario (opcional)
        </label>
        <textarea
          id="review-comment"
          [(ngModel)]="comment"
          name="comment"
          rows="3"
          maxlength="2000"
          placeholder="Comparte tu experiencia con este curso..."
          class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-dark placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary"
        ></textarea>
      </div>

      <button
        type="submit"
        [disabled]="rating() === 0 || isPending()"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {{ isPending() ? 'Enviando...' : 'Publicar reseña' }}
      </button>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ReviewFormComponent {
  readonly courseId = input.required<string>();

  readonly reviewSubmitted = output<{ rating: number; comment?: string }>();

  rating = signal(0);
  comment = '';
  isPending = signal(false);

  onSubmit(): void {
    if (this.rating() === 0) return;

    this.isPending.set(true);

    this.reviewSubmitted.emit({
      rating: this.rating(),
      comment: this.comment.trim() || undefined,
    });

    // Reset after short delay (simulating API call)
    setTimeout(() => {
      this.isPending.set(false);
    }, 500);
  }
}
