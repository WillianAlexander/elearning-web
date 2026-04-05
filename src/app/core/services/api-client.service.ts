import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiListResponse, PaginatedResult } from '../../core/types/api-envelope';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  categoryId?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET request with optional query params
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * GET request returning paginated results
   */
  getPaginated<T>(endpoint: string, params?: SearchParams): Observable<PaginatedResult<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http
      .get<ApiListResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(
        map((response) => this.extractPaginatedData(response)),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * PUT request (full update)
   */
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * PATCH request (partial update)
   */
  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map((response) => this.extractData(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * DELETE request (handles 204 No Content)
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete(`${this.baseUrl}${endpoint}`, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204 || !response.body) {
          return null as T;
        }
        return this.extractData(response.body as ApiResponse<T>);
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Extract data from API envelope
   */
  private extractData<T>(response: ApiResponse<T>): T {
    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
    return response.data;
  }

  /**
   * Extract paginated data from API envelope
   */
  private extractPaginatedData<T>(response: ApiListResponse<T>): PaginatedResult<T> {
    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
    return response.data;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
    } else if (error.error?.errors?.length) {
      // API error with structured response
      message = error.error.errors.map((e: { message: string }) => e.message).join(', ');
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          message = 'Bad request. Please check your input.';
          break;
        case 401:
          message = 'Unauthorized. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 422:
          message = 'Validation error. Please check your input.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = `Error: ${error.status}`;
      }
    }

    return throwError(() => new Error(message));
  }
}
