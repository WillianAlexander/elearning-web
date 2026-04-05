import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="flex items-center gap-1">
      @for (star of stars; track $index) {
        <button
          type="button"
          [disabled]="!interactive()"
          (click)="interactive() && setRating($index + 1)"
          class="p-0.5 transition-transform"
          [class.cursor-pointer]="interactive()"
          [class.scale-110]="interactive()"
        >
          <span [class]="getStarClass($index)" class="material-symbols-outlined text-xl">
            {{ star }}
          </span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class StarRatingComponent {
  readonly value = input<number>(0);
  readonly interactive = input<boolean>(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly ratingChange = output<number>();

  readonly stars = ['star', 'star', 'star', 'star', 'star'];
  private currentRating = signal(0);

  ngOnInit(): void {
    this.currentRating.set(this.value());
  }

  setRating(rating: number): void {
    this.currentRating.set(rating);
    this.ratingChange.emit(rating);
  }

  getStarClass(index: number): string {
    const current = this.interactive() ? this.currentRating() : this.value();

    if (index < current) {
      return 'text-yellow-400'; // Filled star
    }
    return 'text-gray-300'; // Empty star
  }
}
