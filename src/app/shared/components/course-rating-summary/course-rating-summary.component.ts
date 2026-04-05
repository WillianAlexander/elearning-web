import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-course-rating-summary',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  template: `
    @if (reviewCount() > 0) {
      <div [class]="className()">
        <div class="flex items-center gap-1.5">
          <app-star-rating [value]="Math.round(avgRating())" size="sm" />
          <span class="text-sm font-medium text-dark">
            {{ avgRating().toFixed(1) }}
          </span>
          <span class="text-xs text-muted">
            ({{ reviewCount() }} {{ reviewCount() === 1 ? 'reseña' : 'reseñas' }})
          </span>
        </div>
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
export class CourseRatingSummaryComponent {
  readonly avgRating = input.required<number>();
  readonly reviewCount = input.required<number>();
  readonly className = input<string>('');

  Math = Math;
}
