import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';

export interface ReviewUser {
  firstName: string;
  lastName: string;
}

export interface Review {
  id: string;
  user?: ReviewUser;
  rating: number;
  comment?: string;
  createdAt: string;
}

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  template: `
    @if (reviews().length === 0) {
      <p class="text-sm text-muted py-4">
        Aún no hay reseñas para este curso. Sé el primero en dejar una.
      </p>
    } @else {
      <div class="space-y-4">
        @for (review of reviews(); track review.id) {
          <div class="rounded-lg border border-border bg-surface p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-dark">
                  {{ review.user ? review.user.firstName + ' ' + review.user.lastName : 'Usuario' }}
                </span>
                <app-star-rating [value]="review.rating" size="sm" />
              </div>
              <time class="text-xs text-muted">
                {{ formatDate(review.createdAt) }}
              </time>
            </div>
            @if (review.comment) {
              <p class="text-sm text-dark/80">{{ review.comment }}</p>
            }
          </div>
        }
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
export class ReviewsListComponent {
  readonly reviews = input.required<Review[]>();

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-EC');
  }
}
