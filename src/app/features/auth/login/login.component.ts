import { Component, inject, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore, AUTH_STATUS } from '../../../core/stores/auth.store';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { environment } from '../../../../environments/environment';

interface MockUser {
  token: string;
  name: string;
  role: string;
  area?: string;
}

const MOCK_USERS: Record<string, MockUser[]> = {
  Administradores: [{ token: 'mock-token-admin', name: 'Admin Sistema', role: 'admin' }],
  Instructores: [
    { token: 'mock-token-instructor', name: 'Instructor User', role: 'instructor' },
    {
      token: 'mock-token-instructor-2',
      name: 'Maria Gonzalez',
      role: 'instructor',
      area: 'Capacitacion',
    },
    {
      token: 'mock-token-instructor-3',
      name: 'Carlos Ramirez',
      role: 'instructor',
      area: 'Tecnologia',
    },
  ],
  Colaboradores: [
    { token: 'mock-token-colaborador', name: 'Colaborador User', role: 'colaborador' },
    {
      token: 'mock-token-colaborador-2',
      name: 'Ana Martinez',
      role: 'colaborador',
      area: 'Operaciones',
    },
    {
      token: 'mock-token-colaborador-3',
      name: 'Luis Fernandez',
      role: 'colaborador',
      area: 'Creditos',
    },
    {
      token: 'mock-token-colaborador-4',
      name: 'Sofia Lopez',
      role: 'colaborador',
      area: 'Atencion al Cliente',
    },
  ],
};

const ROLE_STYLES: Record<string, { badge: string; avatar: string; label: string }> = {
  admin: {
    badge: 'bg-purple-100 text-purple-700',
    avatar: 'bg-purple-600 text-white',
    label: 'Admin',
  },
  instructor: {
    badge: 'bg-blue-100 text-blue-700',
    avatar: 'bg-blue-600 text-white',
    label: 'Instructor',
  },
  colaborador: {
    badge: 'bg-emerald-100 text-emerald-700',
    avatar: 'bg-emerald-600 text-white',
    label: 'Colaborador',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <main class="flex h-screen w-full overflow-hidden bg-bg">
      <!-- Left Side: Visual Hero -->
      <div
        class="relative hidden w-1/2 items-center justify-center overflow-hidden bg-dark lg:flex"
      >
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/40 to-dark/90"></div>
        <!-- Decorative dot pattern -->
        <div
          class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(#FFFFFF 1px, transparent 1px); background-size: 32px 32px;"
        ></div>
        <!-- Content -->
        <div class="relative z-10 max-w-lg p-12 text-white">
          <h2 class="mb-6 text-4xl font-semibold tracking-tight">
            Crecimiento profesional con claridad institucional.
          </h2>
          <p class="text-lg leading-relaxed text-white/80">
            Plataforma de aprendizaje disenada para profesionales de cooperativas de credito. Sin
            distracciones, solo crecimiento.
          </p>
          <div class="mt-12 flex items-center gap-4 font-mono text-sm text-white/60">
            <div class="flex items-center gap-2">
              <app-icon name="verified_user" [size]="16"></app-icon>
              <span>ENCRIPTACION DE NIVEL BANCARIO</span>
            </div>
            <div class="h-1 w-1 rounded-full bg-white/40"></div>
            <div class="flex items-center gap-2">
              <app-icon name="update" [size]="16"></app-icon>
              <span>ACTUALIZADO 2025</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="relative flex h-full w-full flex-col overflow-y-auto bg-surface lg:w-1/2">
        <!-- Mobile Header -->
        <div class="p-6 pb-0 lg:hidden">
          <div class="flex items-center gap-3">
            <span class="text-xl font-heading font-semibold tracking-tight text-dark"
              >Aula Virtual</span
            >
          </div>
        </div>

        <div class="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
          <div class="flex w-full max-w-[400px] flex-col gap-8">
            <!-- Brand Header Desktop -->
            <div class="mb-2 hidden items-center gap-3 lg:flex">
              <span class="text-xl font-heading font-semibold tracking-tight text-dark"
                >Aula Virtual</span
              >
            </div>

            <!-- Title -->
            <div class="space-y-2">
              <h1 class="text-[32px] font-bold leading-tight tracking-tight text-dark">
                Bienvenido de nuevo
              </h1>
              <p class="text-base text-muted">
                Ingresa tus credenciales para acceder a la plataforma.
              </p>
            </div>

            <!-- Error -->
            @if (error()) {
              <div
                class="flex items-center gap-2 rounded-md bg-error-light p-4 text-sm font-medium text-error-dark"
              >
                <app-icon name="error" [size]="16" className="text-error"></app-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <!-- Form -->
            <form class="flex flex-col gap-5" (ngSubmit)="handleMicrosoftLogin()">
              <!-- Email -->
              <div class="flex flex-col gap-1.5">
                <label
                  for="email"
                  class="text-[12px] font-semibold uppercase tracking-wider text-muted"
                >
                  Email Corporativo
                </label>
                <div class="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="nombre@cooperativa.com"
                    class="w-full rounded-md border border-border bg-surface px-3 py-3 text-[15px] text-dark shadow-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <app-icon
                    name="mail"
                    [size]="20"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted/60"
                  ></app-icon>
                </div>
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1.5">
                <label
                  for="password"
                  class="text-[12px] font-semibold uppercase tracking-wider text-muted"
                >
                  Contrasena
                </label>
                <div class="group relative">
                  <input
                    id="password"
                    name="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="w-full rounded-md border border-border bg-surface px-3 py-3 text-[15px] text-dark shadow-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 transition-colors hover:text-dark focus:outline-none"
                  >
                    <app-icon
                      [name]="showPassword() ? 'visibility' : 'visibility_off'"
                      [size]="20"
                    ></app-icon>
                  </button>
                </div>
              </div>

              <!-- Submit -->
              <div class="flex flex-col gap-4 pt-2">
                <button
                  type="submit"
                  [disabled]="isLoading()"
                  class="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  @if (isLoading()) {
                    <div
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    ></div>
                    <span>Iniciando sesion...</span>
                  } @else {
                    <span>Iniciar Sesion</span>
                    <app-icon name="arrow_forward" [size]="16"></app-icon>
                  }
                </button>
              </div>
            </form>

            <!-- Separator -->
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-border"></div>
              <span class="text-xs font-medium text-muted/60">o</span>
              <div class="h-px flex-1 bg-border"></div>
            </div>

            <!-- Dev User Picker -->
            @if (isDevMode) {
              <div
                class="w-full space-y-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4"
              >
                <!-- Header -->
                <div class="flex items-center justify-center gap-2">
                  <span
                    class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700"
                  >
                    Dev Only
                  </span>
                  <span class="text-sm font-medium text-amber-800">Acceso Rapido</span>
                </div>

                <!-- User Groups -->
                @for (group of mockUserGroups; track group.label) {
                  <div class="space-y-2">
                    <h3 class="text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                      {{ group.label }}
                    </h3>
                    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      @for (user of group.users; track user.token) {
                        <button
                          type="button"
                          [disabled]="isLoading()"
                          (click)="handleDevLogin(user.token)"
                          class="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-left transition-all duration-150 hover:border-primary/30 hover:bg-bg hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div
                            [class]="
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ' +
                              getRoleStyle(user.role).avatar
                            "
                          >
                            {{ getInitials(user.name) }}
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5">
                              <span class="truncate text-sm font-medium text-dark">{{
                                user.name
                              }}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                              <span
                                [class]="
                                  'inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ' +
                                  getRoleStyle(user.role).badge
                                "
                              >
                                {{ getRoleStyle(user.role).label }}
                              </span>
                              @if (user.area) {
                                <span class="truncate text-[11px] text-muted/70">{{
                                  user.area
                                }}</span>
                              }
                            </div>
                          </div>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Footer -->
            <div class="mt-auto pt-12 pb-2">
              <p class="text-xs text-muted/60">
                &copy; 2025 Aula Virtual LMS. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly showPassword = signal(false);
  readonly isDevMode = environment.devMode;
  readonly mockUserGroups = Object.entries(MOCK_USERS).map(([label, users]) => ({ label, users }));

  readonly isLoading = computed(() => this.authStore.status() === AUTH_STATUS.LOADING);
  readonly error = this.authStore.error;

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  handleMicrosoftLogin(): void {
    // TODO: Implement real Azure AD login flow
    // For now, fall back to dev login
    this.authStore.loginAsDev('colaborador');
  }

  handleDevLogin(token: string): void {
    const roleMap: Record<string, 'admin' | 'instructor' | 'colaborador'> = {
      'mock-token-admin': 'admin',
      'mock-token-instructor': 'instructor',
      'mock-token-instructor-2': 'instructor',
      'mock-token-instructor-3': 'instructor',
      'mock-token-colaborador': 'colaborador',
      'mock-token-colaborador-2': 'colaborador',
      'mock-token-colaborador-3': 'colaborador',
      'mock-token-colaborador-4': 'colaborador',
    };
    const role = roleMap[token] ?? 'colaborador';
    this.authStore.loginAsDev(role);
  }

  getRoleStyle(role: string) {
    return ROLE_STYLES[role] ?? ROLE_STYLES['colaborador']!;
  }

  getInitials(name: string): string {
    return getInitials(name);
  }
}
