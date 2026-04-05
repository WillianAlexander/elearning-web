import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../../core/stores/auth.store';
import { UsersService } from '../../../../core/services/users.service';
import { IconComponent, ICON_SIZE } from '../../../../shared/components/icon/icon.component';
import { environment } from '../../../../../environments/environment';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  instructor: 'Instructor',
  colaborador: 'Colaborador',
};

interface HealthData {
  status?: string;
  database?: { status?: string };
  storage?: { status?: string };
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
          <app-icon name="settings" [size]="iconSize.LG" className="text-primary"></app-icon>
        </div>
        <div>
          <h1 class="font-heading text-2xl font-bold text-dark">Configuracion</h1>
          <p class="text-sm text-muted">Administra tu perfil y revisa el estado del sistema</p>
        </div>
      </div>

      <!-- Profile Card -->
      <section class="mt-8">
        <div class="rounded-xl border border-border bg-surface shadow-subtle">
          <!-- Profile Header -->
          <div class="flex items-center gap-4 border-b border-border px-6 py-5">
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
            >
              {{ initials() }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="truncate font-heading text-lg font-semibold text-dark">
                {{ authStore.user()?.firstName }} {{ authStore.user()?.lastName }}
              </h2>
              <p class="truncate text-sm text-muted">{{ authStore.user()?.email }}</p>
              <span
                class="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                <app-icon name="shield_person" [size]="iconSize.XS"></app-icon>
                {{ roleLabel() }}
              </span>
            </div>
          </div>

          <!-- Editable Fields -->
          <div class="p-6">
            <h3
              class="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted"
            >
              <app-icon name="edit" [size]="iconSize.SM"></app-icon>
              Datos Personales
            </h3>

            <div class="grid gap-5 sm:grid-cols-2">
              <!-- Nombre -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Nombre</label>
                <input
                  type="text"
                  [ngModel]="firstName()"
                  (ngModelChange)="firstName.set($event)"
                  placeholder="Tu nombre"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <!-- Apellido -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Apellido</label>
                <input
                  type="text"
                  [ngModel]="lastName()"
                  (ngModelChange)="lastName.set($event)"
                  placeholder="Tu apellido"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <!-- Area -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark"
                  >Area / Departamento</label
                >
                <div class="relative">
                  <div class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <app-icon
                      name="apartment"
                      [size]="iconSize.SM"
                      className="text-muted"
                    ></app-icon>
                  </div>
                  <input
                    type="text"
                    [ngModel]="area()"
                    (ngModelChange)="area.set($event)"
                    placeholder="Ej: Tecnologia de la Informacion"
                    class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
              <!-- Cargo -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-dark">Cargo</label>
                <div class="relative">
                  <div class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <app-icon name="badge" [size]="iconSize.SM" className="text-muted"></app-icon>
                  </div>
                  <input
                    type="text"
                    [ngModel]="cargo()"
                    (ngModelChange)="cargo.set($event)"
                    placeholder="Ej: Jefe de Tecnologia"
                    class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2.5 text-sm text-dark placeholder:text-sidebar-inactive transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <button
                type="button"
                (click)="handleSave()"
                [disabled]="saving() || !isDirty()"
                class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                @if (saving()) {
                  <span
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  ></span>
                  Guardando...
                } @else {
                  <app-icon name="save" [size]="iconSize.SM"></app-icon>
                  Guardar Cambios
                }
              </button>
              @if (isDirty()) {
                <button
                  type="button"
                  (click)="handleDiscard()"
                  class="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-dark"
                >
                  Descartar
                </button>
              }
              @if (!isDirty() && !saving()) {
                <span class="flex items-center gap-1.5 text-sm text-muted">
                  <app-icon
                    name="check_circle"
                    [size]="iconSize.SM"
                    className="text-accent"
                  ></app-icon>
                  Sin cambios pendientes
                </span>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Read-only Account Info -->
      <section class="mt-6">
        <div class="rounded-xl border border-border bg-surface p-6 shadow-subtle">
          <h3
            class="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted"
          >
            <app-icon name="lock" [size]="iconSize.SM"></app-icon>
            Informacion de Cuenta
          </h3>
          <p class="mb-4 text-xs text-muted">
            Estos campos son gestionados por el sistema y no pueden editarse manualmente.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex items-center gap-3 rounded-lg bg-bg px-4 py-3">
              <app-icon name="mail" [size]="iconSize.MD" className="shrink-0 text-muted"></app-icon>
              <div class="min-w-0">
                <p class="text-xs text-muted">Correo Electronico</p>
                <p class="truncate text-sm font-medium text-dark">{{ authStore.user()?.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-lg bg-bg px-4 py-3">
              <app-icon
                name="shield_person"
                [size]="iconSize.MD"
                className="shrink-0 text-muted"
              ></app-icon>
              <div class="min-w-0">
                <p class="text-xs text-muted">Rol</p>
                <p class="truncate text-sm font-medium text-dark">{{ roleLabel() }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- System Health -->
      <section class="mt-6 mb-8">
        <div class="rounded-xl border border-border bg-surface p-6 shadow-subtle">
          <h3
            class="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted"
          >
            <app-icon name="monitoring" [size]="iconSize.SM"></app-icon>
            Estado del Sistema
          </h3>
          <div class="grid gap-4 sm:grid-cols-3">
            @for (card of healthCards(); track card.label) {
              <div class="flex items-start gap-3 rounded-lg border border-border p-4">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light"
                >
                  <app-icon
                    [name]="card.icon"
                    [size]="iconSize.SM"
                    className="text-primary"
                  ></app-icon>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-muted">{{ card.label }}</p>
                  <div class="mt-0.5 flex items-center gap-2">
                    <span [class]="'h-2 w-2 shrink-0 rounded-full ' + card.dotColor"></span>
                    <p class="truncate text-sm font-semibold text-dark">{{ card.value }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AdminSettingsComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  private readonly usersService = inject(UsersService);
  private readonly http = inject(HttpClient);

  readonly iconSize = ICON_SIZE;

  firstName = signal('');
  lastName = signal('');
  area = signal('');
  cargo = signal('');
  readonly saving = signal(false);
  readonly health = signal<HealthData | null>(null);
  readonly healthLoading = signal(true);

  readonly initials = computed(() => {
    const u = this.authStore.user();
    return u ? `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase() : '??';
  });

  readonly roleLabel = computed(() => {
    const role = this.authStore.userRole();
    return ROLE_LABELS[role ?? ''] ?? role ?? '';
  });

  readonly isDirty = computed(() => {
    const u = this.authStore.user();
    if (!u) return false;
    return (
      this.firstName().trim() !== (u.firstName ?? '') ||
      this.lastName().trim() !== (u.lastName ?? '') ||
      this.area().trim() !== (u.area ?? '') ||
      this.cargo().trim() !== (u.cargo ?? '')
    );
  });

  readonly healthCards = computed(() => {
    const h = this.health();
    const loading = this.healthLoading();
    const getStatus = (ok: boolean) => (ok ? 'ok' : loading ? 'loading' : 'error');
    const getDot = (s: string) =>
      s === 'ok' ? 'bg-accent' : s === 'error' ? 'bg-error' : 'bg-alert animate-pulse';

    const apiStatus = getStatus(!!h);
    const dbStatus = getStatus(!!h);
    const storageStatus = getStatus(!!h);

    return [
      {
        label: 'API',
        value: h ? 'v1.0.0' : loading ? 'Verificando...' : 'Sin conexion',
        icon: 'api',
        dotColor: getDot(apiStatus),
      },
      {
        label: 'Base de Datos',
        value: h ? 'Conectada' : loading ? 'Verificando...' : 'Sin conexion',
        icon: 'database',
        dotColor: getDot(dbStatus),
      },
      {
        label: 'Almacenamiento',
        value: h ? 'Activo' : loading ? 'Verificando...' : 'Sin conexion',
        icon: 'cloud_upload',
        dotColor: getDot(storageStatus),
      },
    ];
  });

  ngOnInit() {
    const u = this.authStore.user();
    if (u) {
      this.firstName.set(u.firstName ?? '');
      this.lastName.set(u.lastName ?? '');
      this.area.set(u.area ?? '');
      this.cargo.set(u.cargo ?? '');
    }
    this.loadHealth();
  }

  loadHealth() {
    this.healthLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/health`).subscribe({
      next: (res) => {
        const healthData = res?.data ?? res ?? null;
        this.health.set(healthData);
        this.healthLoading.set(false);
      },
      error: () => {
        this.health.set(null);
        this.healthLoading.set(false);
      },
    });
  }

  async handleSave() {
    const u = this.authStore.user();
    if (!u || !this.isDirty()) return;
    this.saving.set(true);
    try {
      await this.usersService.updateUser(u.id, {
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        area: this.area().trim(),
        cargo: this.cargo().trim(),
      });
      await this.authStore.checkAuth();
    } catch {
      /* global error handler */
    } finally {
      this.saving.set(false);
    }
  }

  handleDiscard() {
    const u = this.authStore.user();
    if (!u) return;
    this.firstName.set(u.firstName ?? '');
    this.lastName.set(u.lastName ?? '');
    this.area.set(u.area ?? '');
    this.cargo.set(u.cargo ?? '');
  }
}
