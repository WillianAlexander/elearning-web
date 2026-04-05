import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../user-table/user-table.component';

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  role: string;
  area?: string;
  cargo?: string;
}

export interface EditUserFormPayload extends UpdateUserPayload {
  role: string;
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg">
          <form (ngSubmit)="onSubmit()" class="p-0">
            <h3 class="text-lg font-semibold text-dark">Editar Usuario</h3>
            <p class="mt-1 text-sm text-muted">
              Modifica los datos del usuario. El email no es editable.
            </p>

            @if (user()) {
              <p
                class="mt-3 rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-muted"
              >
                <span class="font-medium text-dark">Email:</span> {{ user()!.email }}
              </p>
            }

            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="edit-firstName" class="block text-sm font-medium text-dark">
                  Nombre
                </label>
                <input
                  id="edit-firstName"
                  name="firstName"
                  type="text"
                  required
                  maxlength="150"
                  [(ngModel)]="form.firstName"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label for="edit-lastName" class="block text-sm font-medium text-dark">
                  Apellido
                </label>
                <input
                  id="edit-lastName"
                  name="lastName"
                  type="text"
                  required
                  maxlength="150"
                  [(ngModel)]="form.lastName"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label for="edit-role" class="block text-sm font-medium text-dark"> Rol </label>
                <select
                  id="edit-role"
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
                <label for="edit-area" class="block text-sm font-medium text-dark"> Área </label>
                <input
                  id="edit-area"
                  name="area"
                  type="text"
                  maxlength="150"
                  [(ngModel)]="form.area"
                  class="mt-1 block w-full rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-dark placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="edit-cargo" class="block text-sm font-medium text-dark"> Cargo </label>
                <input
                  id="edit-cargo"
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
                {{ isPending() ? 'Guardando...' : 'Guardar Cambios' }}
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
export class EditUserDialogComponent implements OnInit {
  readonly open = input<boolean>(false);
  readonly user = input<User | null>(null);
  readonly isPending = input<boolean>(false);

  readonly submit = output<EditUserFormPayload>();
  readonly cancel = output<void>();

  form: EditUserFormPayload = {
    firstName: '',
    lastName: '',
    role: 'INSTRUCTOR',
    area: '',
    cargo: '',
  };

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const u = this.user();
    if (u) {
      this.form = {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        area: u.area ?? '',
        cargo: u.cargo ?? '',
      };
    } else {
      this.form = {
        firstName: '',
        lastName: '',
        role: 'INSTRUCTOR',
        area: '',
        cargo: '',
      };
    }
  }

  onSubmit(): void {
    this.submit.emit({ ...this.form });
  }

  onCancel(): void {
    this.buildForm();
    this.cancel.emit();
  }
}
