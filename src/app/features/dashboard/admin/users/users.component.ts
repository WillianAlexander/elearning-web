import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UsersService, UserFilters } from '../../../../core/services/users.service';
import { User } from '../../../../core/types/models';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

type RoleFilter = 'all' | 'instructor' | 'collaborator' | 'admin';
type ActiveFilter = 'all' | 'true' | 'false';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <app-icon name="group" [size]="24" className="text-primary"></app-icon>
          </div>
          <div>
            <h1 class="font-heading text-2xl font-bold text-dark">Gestión de Usuarios</h1>
            <p class="text-sm text-muted">
              {{ totalItems() }} usuario{{ totalItems() !== 1 ? 's' : '' }} registrado{{
                totalItems() !== 1 ? 's' : ''
              }}
            </p>
          </div>
        </div>
        <button
          type="button"
          (click)="showCreateDialog.set(true)"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-subtle transition-colors hover:bg-primary-hover"
        >
          <app-icon name="person_add" [size]="18"></app-icon>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filters -->
      <div class="mt-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <!-- Role filter -->
          <div class="flex items-center gap-1 rounded-lg bg-bg p-1">
            @for (opt of roleOptions; track opt.value) {
              <button
                type="button"
                (click)="roleFilter.set(opt.value)"
                class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                [class.bg-surface]="roleFilter() === opt.value"
                [class.text-dark]="roleFilter() === opt.value"
                [class.shadow-subtle]="roleFilter() === opt.value"
                [class.text-muted]="roleFilter() !== opt.value"
                [class.hover:text-dark]="roleFilter() !== opt.value"
              >
                {{ opt.label }}
              </button>
            }
          </div>
          <!-- Active filter -->
          <div class="flex items-center gap-1 rounded-lg bg-bg p-1">
            <button
              type="button"
              (click)="activeFilter.set('true')"
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              [class.bg-surface]="activeFilter() === 'true'"
              [class.text-dark]="activeFilter() === 'true'"
              [class.shadow-subtle]="activeFilter() === 'true'"
              [class.text-muted]="activeFilter() !== 'true'"
            >
              Activos
            </button>
            <button
              type="button"
              (click)="activeFilter.set('false')"
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              [class.bg-surface]="activeFilter() === 'false'"
              [class.text-dark]="activeFilter() === 'false'"
              [class.shadow-subtle]="activeFilter() === 'false'"
              [class.text-muted]="activeFilter() !== 'false'"
            >
              Inactivos
            </button>
          </div>
          <!-- Search -->
          <div class="relative flex-1 lg:max-w-xs">
            <app-icon
              name="search"
              [size]="20"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            ></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar usuarios..."
              class="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="mt-6">
        @if (loading()) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-subtle"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-muted border-t-primary"
            ></div>
            <p class="text-sm text-muted">Cargando usuarios...</p>
          </div>
        }

        @if (error()) {
          <div
            class="flex items-center gap-3 rounded-xl border border-error-muted bg-error-light p-4"
          >
            <app-icon name="error" [size]="24" className="shrink-0 text-error"></app-icon>
            <p class="text-sm text-error-dark">Error al cargar usuarios: {{ error() }}</p>
          </div>
        }

        @if (!loading() && !error() && users().length === 0) {
          <app-empty-state
            [title]="
              searchQuery || roleFilter() !== 'all' || activeFilter() !== 'true'
                ? 'No hay usuarios'
                : 'No hay usuarios'
            "
            [description]="
              searchQuery || roleFilter() !== 'all' || activeFilter() !== 'true'
                ? 'No se encontraron usuarios con los filtros seleccionados.'
                : 'Aún no hay usuarios registrados en la plataforma.'
            "
          ></app-empty-state>
        }

        @if (!loading() && !error() && users().length > 0) {
          <div class="overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border bg-bg">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    Usuario
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    Rol
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    Área
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    Estado
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr class="border-b border-border transition-colors hover:bg-primary-light/30">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary"
                        >
                          {{ user.firstName.charAt(0) + user.lastName.charAt(0) }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-dark">
                            {{ user.firstName }} {{ user.lastName }}
                          </p>
                          <p class="text-xs text-muted">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full bg-bg px-2.5 py-0.5 text-xs font-medium text-dark"
                      >
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-sm text-dark">{{ user.area || '-' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      @if (user.isActive) {
                        <span
                          class="inline-flex items-center gap-1 text-xs font-medium text-accent"
                        >
                          <app-icon name="check_circle" [size]="14"></app-icon>
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 text-xs font-medium text-muted">
                          <app-icon name="cancel" [size]="14"></app-icon>
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          (click)="setEditTarget(user)"
                          class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-light"
                        >
                          <app-icon name="edit" [size]="14"></app-icon>
                          Editar
                        </button>
                        @if (user.isActive) {
                          <button
                            type="button"
                            (click)="deactivateTarget.set(user)"
                            class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error-light"
                          >
                            <app-icon name="block" [size]="14"></app-icon>
                            Desactivar
                          </button>
                        } @else {
                          <button
                            type="button"
                            (click)="reactivateTarget.set(user)"
                            class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent-light"
                          >
                            <app-icon name="refresh" [size]="14"></app-icon>
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

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div
              class="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-subtle"
            >
              <p class="text-sm text-muted">
                Página <span class="font-medium text-dark">{{ page() }}</span> de
                <span class="font-medium text-dark">{{ totalPages() }}</span> ({{ totalItems() }}
                resultados)
              </p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="goToPage(page() - 1)"
                  [disabled]="page() <= 1"
                  class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <app-icon name="chevron_left" [size]="18"></app-icon>
                  Anterior
                </button>
                <button
                  type="button"
                  (click)="goToPage(page() + 1)"
                  [disabled]="page() >= totalPages()"
                  class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <app-icon name="chevron_right" [size]="18"></app-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Deactivate confirmation -->
      <app-confirm-dialog
        [open]="!!deactivateTarget()"
        title="Desactivar usuario"
        [message]="
          '¿Estás seguro de desactivar a ' +
          deactivateTarget()?.firstName +
          ' ' +
          deactivateTarget()?.lastName +
          '? No podrá acceder a la plataforma.'
        "
        confirmLabel="Desactivar"
        variant="danger"
        (confirm)="handleDeactivate()"
        (cancel)="deactivateTarget.set(null)"
      ></app-confirm-dialog>

      <!-- Reactivate confirmation -->
      <app-confirm-dialog
        [open]="!!reactivateTarget()"
        title="Reactivar usuario"
        [message]="
          '¿Estás seguro de reactivar a ' +
          reactivateTarget()?.firstName +
          ' ' +
          reactivateTarget()?.lastName +
          '? Podrá acceder nuevamente a la plataforma.'
        "
        confirmLabel="Reactivar"
        variant="default"
        (confirm)="handleReactivate()"
        (cancel)="reactivateTarget.set(null)"
      ></app-confirm-dialog>

      <!-- Create/Edit Dialog -->
      @if (showCreateDialog() || editTarget()) {
        <dialog
          open
          class="fixed inset-0 z-50 m-auto max-w-md rounded-lg border border-border bg-surface p-0 shadow-lg backdrop:bg-black/50"
        >
          <div class="p-6">
            <h3 class="text-lg font-semibold text-dark">
              {{ editTarget() ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>

            <div class="mt-4 space-y-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Nombre</label>
                <input
                  type="text"
                  [(ngModel)]="formFirstName"
                  class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Apellido</label>
                <input
                  type="text"
                  [(ngModel)]="formLastName"
                  class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Email</label>
                <input
                  type="email"
                  [(ngModel)]="formEmail"
                  class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Rol</label>
                <select
                  [(ngModel)]="formRole"
                  class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-dark transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="instructor">Instructor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="closeDialog()"
                class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="editTarget() ? handleEdit() : handleCreate()"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                {{ editTarget() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </dialog>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Pagination
  page = signal(1);
  totalItems = signal(0);
  totalPages = signal(1);

  // Filters
  roleFilter = signal<RoleFilter>('all');
  activeFilter = signal<ActiveFilter>('true');
  searchQuery = '';

  // Dialogs
  showCreateDialog = signal(false);
  editTarget = signal<User | null>(null);
  deactivateTarget = signal<User | null>(null);
  reactivateTarget = signal<User | null>(null);

  // Form
  formFirstName = '';
  formLastName = '';
  formEmail = '';
  formRole = 'colaborador';

  roleOptions = [
    { value: 'all' as RoleFilter, label: 'Todos' },
    { value: 'collaborator' as RoleFilter, label: 'Colaborador' },
    { value: 'instructor' as RoleFilter, label: 'Instructor' },
    { value: 'admin' as RoleFilter, label: 'Admin' },
  ];

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const filters: UserFilters = {
        page: this.page(),
        pageSize: 20,
      };
      if (this.roleFilter() !== 'all') {
        const roleMap: Record<string, string> = {
          admin: 'administrador',
          instructor: 'instructor',
          collaborator: 'colaborador',
        };
        filters.role = roleMap[this.roleFilter()] ?? this.roleFilter();
      }
      if (this.activeFilter() !== 'all') {
        filters.isActive = this.activeFilter();
      }
      if (this.searchQuery) {
        filters.search = this.searchQuery;
      }
      const response = await firstValueFrom(this.usersService.getUsers(filters));
      this.users.set(response?.items ?? response ?? []);
      this.totalItems.set(response?.totalItems ?? 0);
      this.totalPages.set(response?.totalPages ?? 1);
    } catch (e: any) {
      this.error.set(e.message || 'Error al cargar usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.page.set(1);
    this.loadUsers();
  }

  goToPage(p: number) {
    this.page.set(p);
    this.loadUsers();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'instructor':
        return 'Instructor';
      case 'collaborator':
        return 'Colaborador';
      default:
        return role;
    }
  }

  setEditTarget(user: User) {
    this.editTarget.set(user);
    this.formFirstName = user.firstName;
    this.formLastName = user.lastName;
    this.formEmail = user.email;
    this.formRole = user.role;
  }

  closeDialog() {
    this.showCreateDialog.set(false);
    this.editTarget.set(null);
    this.formFirstName = '';
    this.formLastName = '';
    this.formEmail = '';
    this.formRole = 'collaborador';
  }

  async handleCreate() {
    try {
      await firstValueFrom(
        this.usersService.createUser({
          firstName: this.formFirstName,
          lastName: this.formLastName,
          email: this.formEmail,
          role: this.formRole,
        }),
      );
      this.closeDialog();
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(e.message || 'Error al crear usuario');
    }
  }

  async handleEdit() {
    const target = this.editTarget();
    if (!target) return;
    try {
      // Only send fields that actually changed
      const changes: Record<string, string> = {};
      if (this.formFirstName !== target.firstName) changes['firstName'] = this.formFirstName;
      if (this.formLastName !== target.lastName) changes['lastName'] = this.formLastName;
      if (this.formEmail !== target.email) changes['email'] = this.formEmail;

      if (Object.keys(changes).length > 0) {
        await firstValueFrom(this.usersService.updateUser(target.id, changes));
      }
      if (this.formRole !== target.role) {
        await firstValueFrom(this.usersService.updateRole(target.id, this.formRole));
      }
      this.closeDialog();
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(e.message || 'Error al actualizar usuario');
    }
  }

  async handleDeactivate() {
    const target = this.deactivateTarget();
    if (!target) return;
    try {
      await firstValueFrom(this.usersService.deactivateUser(target.id));
      this.deactivateTarget.set(null);
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(e.message || 'Error al desactivar usuario');
    }
  }

  async handleReactivate() {
    const target = this.reactivateTarget();
    if (!target) return;
    try {
      await firstValueFrom(this.usersService.reactivateUser(target.id));
      this.reactivateTarget.set(null);
      await this.loadUsers();
    } catch (e: any) {
      this.error.set(e.message || 'Error al reactivar usuario');
    }
  }
}
