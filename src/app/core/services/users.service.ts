import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, SearchParams } from './api-client.service';
import { User } from '../types';
import { PaginatedResult } from '../types/api-envelope';

export interface UserProfile extends User {
  enrolledCourses?: number;
  completedCourses?: number;
  totalProgress?: number;
}

export interface UserFilters extends SearchParams {
  role?: string;
  isActive?: string;
  area?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly api = inject(ApiClient);

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/users/me');
  }

  /**
   * Update current user profile
   */
  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.patch<User>('/users/me', data);
  }

  /**
   * Get user by ID (admin/instructor)
   */
  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  /**
   * Get all users with pagination (admin)
   */
  getUsers(filters?: UserFilters): Observable<PaginatedResult<User>> {
    return this.api.getPaginated<User>('/users', filters as Record<string, string>);
  }

  /**
   * Create user (admin)
   */
  createUser(data: Partial<User>): Observable<User> {
    return this.api.post<User>('/users', data);
  }

  /**
   * Update user (admin)
   */
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${id}`, data);
  }

  /**
   * Deactivate user (admin) - C-12 fix: use PATCH not DELETE
   */
  deactivateUser(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/deactivate`, {});
  }

  /**
   * Reactivate user (admin) - C-12 fix: add missing method
   */
  reactivateUser(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/reactivate`, {});
  }

  /**
   * Update user role (admin) - C-12 fix: add missing method
   */
  updateRole(id: string, role: string): Observable<User> {
    const apiRole = this.toApiRole(role);
    return this.api.patch<User>(`/users/${id}/role`, { role: apiRole });
  }

  /** Normalize frontend role names to backend API values */
  private toApiRole(role: string): string {
    const map: Record<string, string> = {
      admin: 'administrador',
      instructor: 'instructor',
      colaborador: 'colaborador',
      collaborator: 'colaborador',
    };
    return map[role.toLowerCase()] ?? role;
  }

  /**
   * Get user enrollments
   */
  getUserEnrollments(userId: string): Observable<any[]> {
    return this.api.get<any[]>(`/users/${userId}/enrollments`);
  }

  /**
   * Get user certificates
   */
  getUserCertificates(userId: string): Observable<any[]> {
    return this.api.get<any[]>(`/users/${userId}/certificates`);
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): Observable<any> {
    return this.api.get<any>(`/users/${userId}/stats`);
  }

  /**
   * Upload avatar
   */
  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ url: string }>('/users/me/avatar', formData);
  }
}
