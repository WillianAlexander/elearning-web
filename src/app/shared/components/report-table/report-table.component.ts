import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Column<T> {
  header: string;
  accessor: (row: T) => string | number;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-border bg-surface shadow-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-dark">{{ title() }}</span>
          <span class="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-muted">
            {{ data().length }}
          </span>
        </div>
        <button
          type="button"
          (click)="exportCsv()"
          [disabled]="data().length === 0"
          class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 hover:text-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span class="material-symbols-outlined text-xs">download</span>
          Exportar CSV
        </button>
      </div>

      <!-- Table -->
      @if (data().length === 0) {
        <div class="px-5 py-12 text-center">
          <p class="text-muted">No hay registros para mostrar.</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead>
              <tr class="bg-gray-50">
                @for (col of columns(); track col.header) {
                  <th
                    class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted"
                    [class.text-right]="col.align === 'right'"
                    [class.text-center]="col.align === 'center'"
                    [class.text-left]="!col.align || col.align === 'left'"
                  >
                    {{ col.header }}
                  </th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (row of data(); track getKey(row)) {
                <tr class="transition-colors hover:bg-primary/5">
                  @for (col of columns(); track col.header) {
                    <td
                      class="whitespace-nowrap px-5 py-3.5 text-sm text-dark"
                      [class.text-right]="col.align === 'right'"
                      [class.text-center]="col.align === 'center'"
                      [class.text-left]="!col.align || col.align === 'left'"
                    >
                      {{ col.accessor(row) }}
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
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
export class ReportTableComponent<T> {
  readonly columns = input.required<Column<T>[]>();
  readonly data = input.required<T[]>();
  readonly keyField = input.required<string>(); // Changed to accept property name as string
  readonly title = input<string>('');
  readonly icon = input<string>('');
  readonly emptyMessage = input<string>('No hay registros para mostrar.');

  getKey(row: T): string {
    const key = this.keyField();
    return String((row as any)[key]);
  }

  exportCsv(): void {
    const cols = this.columns();
    const rows = this.data();

    const headers = cols.map((c) => c.header).join(',');
    const dataRows = rows.map((row) =>
      cols
        .map((c) => {
          const val = String(c.accessor(row));
          return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(','),
    );

    const csv = [headers, ...dataRows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.title().toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
