import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-course-filters',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <!-- Search -->
      <div class="group relative flex-1">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span
            class="material-symbols-outlined text-muted transition-colors group-focus-within:text-primary"
            >search</span
          >
        </div>
        <input
          type="text"
          [value]="search()"
          (input)="onSearchChange($event)"
          placeholder="Buscar cursos..."
          class="block w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-dark shadow-sm placeholder:text-muted transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>

      <!-- Category -->
      <select
        [value]="selectedCategory() || ''"
        (change)="onCategoryChange($event)"
        class="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
      >
        <option value="">Todas las categorias</option>
        @for (cat of categories(); track cat.id) {
          <option [value]="cat.id">{{ cat.name }}</option>
        }
      </select>

      <!-- Difficulty -->
      <select
        [value]="selectedDifficulty() || ''"
        (change)="onDifficultyChange($event)"
        class="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-dark shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
      >
        <option value="">Todas las dificultades</option>
        <option value="beginner">Principiante</option>
        <option value="intermediate">Intermedio</option>
        <option value="advanced">Avanzado</option>
      </select>

      <!-- Clear filters -->
      @if (hasActiveFilters()) {
        <button
          type="button"
          (click)="clearFilters.emit()"
          class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <span class="material-symbols-outlined text-base">clear</span>
          Limpiar
        </button>
      }
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
export class CourseFiltersComponent {
  readonly search = input<string>('');
  readonly selectedCategory = input<string | null>(null);
  readonly selectedDifficulty = input<string | null>(null);
  readonly categories = input<any[]>([]);

  readonly searchChange = output<string>();
  readonly categoryChange = output<string | null>();
  readonly difficultyChange = output<string | null>();
  readonly clearFilters = output<void>();

  hasActiveFilters(): boolean {
    return !!(this.search() || this.selectedCategory() || this.selectedDifficulty());
  }

  onSearchChange(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryChange.emit(value || null);
  }

  onDifficultyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.difficultyChange.emit(value || null);
  }
}
