import { Component, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-between px-4 py-3 border-t border-border">
        <!-- Results info -->
        <div class="text-sm text-muted">
          Mostrando {{ startItem() }} - {{ endItem() }} de {{ totalItems() }} resultados
        </div>

        <!-- Pagination controls -->
        <div class="flex items-center gap-2">
          <!-- Previous -->
          <button
            [disabled]="currentPage() === 1"
            (click)="goToPage(currentPage() - 1)"
            [ngClass]="prevButtonClasses()"
            class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <!-- Page numbers -->
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-3 py-2 text-muted">...</span>
            } @else {
              <button
                [disabled]="page === currentPage()"
                (click)="goToPage(page)"
                [ngClass]="pageButtonClasses(page)"
                class="min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors"
              >
                {{ page }}
              </button>
            }
          }

          <!-- Next -->
          <button
            [disabled]="currentPage() === totalPages()"
            (click)="goToPage(currentPage() + 1)"
            [ngClass]="nextButtonClasses()"
            class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
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
export class PaginationComponent {
  readonly currentPage = input<number>(1);
  readonly totalItems = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly maxVisible = input<number>(5);

  readonly pageChanged = output<number>();

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  readonly startItem = computed(() =>
    Math.min((this.currentPage() - 1) * this.pageSize() + 1, this.totalItems()),
  );

  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const max = this.maxVisible();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + max - 1);

    if (end - start < max - 1) {
      start = Math.max(1, end - max + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push(-1); // Ellipsis
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total) {
      if (end < total - 1) pages.push(-1); // Ellipsis
      pages.push(total);
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChanged.emit(page);
    }
  }

  prevButtonClasses(): Record<string, boolean> {
    return {
      'text-dark hover:bg-primary/10': this.currentPage() > 1,
      'text-muted cursor-not-allowed': this.currentPage() === 1,
    };
  }

  nextButtonClasses(): Record<string, boolean> {
    return {
      'text-dark hover:bg-primary/10': this.currentPage() < this.totalPages(),
      'text-muted cursor-not-allowed': this.currentPage() === this.totalPages(),
    };
  }

  pageButtonClasses(page: number): Record<string, boolean> {
    const isActive = page === this.currentPage();
    return {
      'bg-primary text-white': isActive,
      'text-dark hover:bg-primary/10': !isActive,
    };
  }
}
