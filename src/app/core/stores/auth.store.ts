import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../types';

export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
} as const;

type AuthStatusType = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _status = signal<AuthStatusType>(AUTH_STATUS.IDLE);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._status() === AUTH_STATUS.AUTHENTICATED);
  readonly isLoading = computed(() => this._status() === AUTH_STATUS.LOADING);
  readonly userRole = computed(() => this.normalizeRole(this._user()?.role));
  readonly isAdmin = computed(() => {
    const r = this._user()?.role;
    return r === 'admin' || r === 'administrador';
  });
  readonly isInstructor = computed(() => {
    const r = this._user()?.role;
    return r === 'instructor' || this.isAdmin();
  });
  readonly isColaborador = computed(() => {
    const r = this._user()?.role;
    return r === 'colaborador';
  });
  readonly userFullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  constructor() {
    void this.checkAuth();
  }

  async checkAuth(): Promise<void> {
    const token = localStorage.getItem('lms_token');
    if (!token) {
      this._status.set(AUTH_STATUS.UNAUTHENTICATED);
      return;
    }
    this._status.set(AUTH_STATUS.LOADING);
    this._token.set(token);
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: { user: User } }>(`${this.baseUrl}/auth/me`),
      );
      this._user.set(response.data.user);
      this._status.set(AUTH_STATUS.AUTHENTICATED);
    } catch {
      localStorage.removeItem('lms_token');
      this._token.set(null);
      this._status.set(AUTH_STATUS.UNAUTHENTICATED);
    }
  }

  async login(azureAdToken: string): Promise<void> {
    this._status.set(AUTH_STATUS.LOADING);
    this._error.set(null);
    try {
      localStorage.setItem('lms_token', azureAdToken);
      this._token.set(azureAdToken);
      const response = await firstValueFrom(
        this.http.post<{ data: { user: User } }>(`${this.baseUrl}/auth/azure/callback`, {
          token: azureAdToken,
        }),
      );
      this._user.set(response.data.user);
      this._status.set(AUTH_STATUS.AUTHENTICATED);
    } catch (err: unknown) {
      localStorage.removeItem('lms_token');
      this._token.set(null);
      this._status.set(AUTH_STATUS.UNAUTHENTICATED);
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      this._error.set(msg);
      throw err;
    }
  }

  logout(): void {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user_id');
    localStorage.removeItem('lms_user_email');
    localStorage.removeItem('lms_user_role');
    localStorage.removeItem('lms_user_name');
    this._user.set(null);
    this._token.set(null);
    this._status.set(AUTH_STATUS.UNAUTHENTICATED);
    this._error.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  hasRole(role: string): boolean {
    const r = this.normalizeRole(this._user()?.role);
    return r === role;
  }

  private normalizeRole(role: string | undefined | null): string | null {
    if (!role) return null;
    const map: Record<string, string> = {
      administrador: 'admin',
      instructor: 'instructor',
      colaborador: 'colaborador',
    };
    return map[role.toLowerCase()] ?? role;
  }

  hasAnyRole(roles: string[]): boolean {
    const r = this.normalizeRole(this._user()?.role);
    return r ? roles.includes(r) : false;
  }

  // Dev-only: login via mock token through the real API
  loginAsDev(userType: 'admin' | 'instructor' | 'colaborador'): void {
    const tokenMap: Record<string, string> = {
      admin: 'mock-token-admin',
      instructor: 'mock-token-instructor',
      colaborador: 'mock-token-colaborador',
    };
    const mockToken = tokenMap[userType] ?? 'mock-token-colaborador';

    this._status.set(AUTH_STATUS.LOADING);
    this._error.set(null);

    this.http.post<any>(`${this.baseUrl}/auth/login`, { token: mockToken }).subscribe({
      next: (res) => {
        const user = res?.data?.user ?? res?.user ?? res?.data ?? null;
        if (user) {
          localStorage.setItem('lms_token', mockToken);
          this._token.set(mockToken);
          this._user.set(user);
          this._status.set(AUTH_STATUS.AUTHENTICATED);
        } else {
          this._status.set(AUTH_STATUS.UNAUTHENTICATED);
          this._error.set('No se pudo obtener el usuario');
        }
      },
      error: (err) => {
        this._status.set(AUTH_STATUS.UNAUTHENTICATED);
        this._error.set(err?.error?.message ?? 'Error al iniciar sesion');
      },
    });
  }
}
