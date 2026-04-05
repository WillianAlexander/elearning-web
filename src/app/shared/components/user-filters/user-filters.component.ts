import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../user-table/user-table.component';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-surface p-2 shadow-sm sm:flex-row sm:items-center"
    >
      <!-- Search -->
      <div class="relative w-full sm:max-w-md">
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"
        >
          <span class="material-symbols-outlined text-xl">search</span>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email o departamento..."
          [(ngModel)]="searchValue"
          (ngModelChange)="onSearchChange($event)"
          class="block w-full rounded-md border border-border bg-gray-50 py-2 pl-10 pr-3 text-sm leading-5 text-dark placeholder:text-muted/70 transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <!-- Actions -->
      <div class="flex w-full items-center gap-3 sm:w-auto">
        <select
          [value]="role()"
          (change)="onRoleChange($event)"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="COLABORADOR">Colaborador</option>
        </select>
        <select
          [value]="isActive()"
          (change)="onActiveChange($event)"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button
          type="button"
          (click)="onExportCsv()"
          [disabled]="users().length === 0"
          class="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-lg mr-2 text-muted">download</span>
          Exportar CSV
        </button>
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
export class UserFiltersComponent {
  readonly role = input<'all' | string>('all');
  readonly isActive = input<'all' | 'true' | 'false'>('all');
  readonly search = input<string>('');
  readonly users = input.required<User[]>();

  readonly roleChange = output<'all' | string>();
  readonly activeChange = output<'all' | 'true' | 'false'>();
  readonly searchChange = output<string>();

  searchValue = '';

  ngOnInit(): void {
    this.searchValue = this.search();
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | string;
    this.roleChange.emit(value);
  }

  onActiveChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | 'true' | 'false';
    this.activeChange.emit(value);
  }

  onExportCsv(): void {
    const users = this.users();
    const headers = ['Nombre', 'Apellido', 'Email', 'Rol', 'Área', 'Cargo', 'Estado'];
    const rows = users.map((u) => [
      u.firstName,
      u.lastName,
      u.email,
      u.role,
      u.area || '',
      u.cargo || '',
      u.isActive ? 'Activo' : 'Inactivo',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
