import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  area?: string;
  cargo?: string;
}

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg">
          <form (ngSubmit)="onSubmit()" class="p-0">
            <h3 class="text-lg font-semibold text-dark">Nuevo Usuario</h3>
            <p class="mt-1 text-sm text-muted">
              Crea un usuario con rol de Instructor o Administrador. Los colaboradores se
              provisionan automáticamente via Azure AD.
            </p>

            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="create-firstName" class="block text-sm font-medium text-dark">
                  Nombre
                </label>
                <input
                  id="create-firstName"
                  name="firstName"
                  type="text"
                  required
                  maxlength="150"
                  [(ngModel)]="form.firstName"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label for="create-lastName" class="block text-sm font-medium text-dark">
                  Apellido
                </label>
                <input
                  id="create-lastName"
                  name="lastName"
                  type="text"
                  required
                  maxlength="150"
                  [(ngModel)]="form.lastName"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="create-email" class="block text-sm font-medium text-dark">
                  Email
                </label>
                <input
                  id="create-email"
                  name="email"
                  type="email"
                  required
                  [(ngModel)]="form.email"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label for="create-role" class="block text-sm font-medium text-dark"> Rol </label>
                <select
                  id="create-role"
                  name="role"
                  required
                  [(ngModel)]="form.role"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <div>
                <label for="create-area" class="block text-sm font-medium text-dark"> Área </label>
                <input
                  id="create-area"
                  name="area"
                  type="text"
                  maxlength="150"
                  [(ngModel)]="form.area"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="create-cargo" class="block text-sm font-medium text-dark">
                  Cargo
                </label>
                <input
                  id="create-cargo"
                  name="cargo"
                  type="text"
                  maxlength="150"
                  [(ngModel)]="form.cargo"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="onCancel()"
                class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="isPending()"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {{ isPending() ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
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
export class CreateUserDialogComponent {
  readonly open = input<boolean>(false);
  readonly isPending = input<boolean>(false);

  readonly submit = output<CreateUserPayload>();
  readonly cancel = output<void>();

  form: CreateUserPayload = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'INSTRUCTOR',
    area: '',
    cargo: '',
  };

  onSubmit(): void {
    this.submit.emit({ ...this.form });
  }

  onCancel(): void {
    this.form = {
      email: '',
      firstName: '',
      lastName: '',
      role: 'INSTRUCTOR',
      area: '',
      cargo: '',
    };
    this.cancel.emit();
  }
}
