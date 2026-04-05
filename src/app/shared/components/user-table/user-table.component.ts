import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  area?: string;
  cargo?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div class="overflow-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th
                class="border-b border-border px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Usuario
              </th>
              <th
                class="hidden border-b border-border px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted md:table-cell"
              >
                Departamento
              </th>
              <th
                class="hidden border-b border-border px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted lg:table-cell"
              >
                Rol
              </th>
              <th
                class="border-b border-border px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Estado
              </th>
              <th
                class="border-b border-border px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-surface">
            @for (user of users(); track user.id) {
              <tr class="group transition-colors hover:bg-primary/5">
                <!-- User cell -->
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-bold text-primary"
                    >
                      {{ getInitials(user.firstName, user.lastName) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-dark">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-muted">{{ user.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Department -->
                <td class="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                  <div class="text-sm text-dark">{{ user.area || '—' }}</div>
                </td>

                <!-- Role badge -->
                <td class="hidden whitespace-nowrap px-6 py-4 lg:table-cell">
                  <span
                    class="inline-flex items-center rounded border border-border bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-muted"
                  >
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>

                <!-- Status badge -->
                <td class="whitespace-nowrap px-6 py-4">
                  @if (user.isActive) {
                    <span
                      class="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
                      Activo
                    </span>
                  } @else {
                    <span
                      class="inline-flex items-center rounded-full border border-border bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-muted"
                    >
                      <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      Inactivo
                    </span>
                  }
                </td>

                <!-- Actions -->
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div class="inline-flex items-center justify-end gap-2">
                    @if (user.role !== 'COLABORADOR') {
                      <button
                        type="button"
                        (click)="edit.emit(user)"
                        class="rounded-md px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                      >
                        Editar
                      </button>
                    } @else {
                      <span class="rounded-md px-3 py-1.5 text-xs font-medium text-muted">
                        Azure AD
                      </span>
                    }

                    @if (user.isActive) {
                      <button
                        type="button"
                        (click)="deactivate.emit(user)"
                        class="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="reactivate.emit(user)"
                        class="rounded-md px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                      >
                        Reactivar
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
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
export class UserTableComponent {
  readonly users = input.required<User[]>();
  readonly isUpdating = input<boolean>(false);

  readonly edit = output<User>();
  readonly deactivate = output<User>();
  readonly reactivate = output<User>();

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getRoleLabel(role: string): string {
    const roles: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      INSTRUCTOR: 'Instructor',
      COLABORADOR: 'Colaborador',
    };
    return roles[role] || role;
  }
}
