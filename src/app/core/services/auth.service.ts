import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiError } from '../types/api-envelope';
import { User } from '../types/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }
          return response.data;
        }),
        catchError((error) => {
          const message = error?.error?.errors?.[0]?.message ?? error.message ?? 'Login failed';
          return throwError(() => new Error(message));
        }),
      );
  }

  /**
   * Validate current token and get user data
   */
  validateToken(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors[0].message);
        }
        return response.data;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/auth/forgot-password`, { email })
      .pipe(
        map(() => void 0),
        catchError((error) => {
          const message = error?.error?.errors?.[0]?.message ?? 'Request failed';
          return throwError(() => new Error(message));
        }),
      );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.baseUrl}/auth/reset-password`, {
        token,
        newPassword,
      })
      .pipe(
        map(() => void 0),
        catchError((error) => {
          const message = error?.error?.errors?.[0]?.message ?? 'Reset failed';
          return throwError(() => new Error(message));
        }),
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh`, {}).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors[0].message);
        }
        return response.data;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * Logout (invalidate token on server)
   */
  logout(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => {
        // Even if server logout fails, we clear local state
        return throwError(() => new Error('Logout failed'));
      }),
    );
  }
}
