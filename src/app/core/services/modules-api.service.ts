import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons?: any[];
}

export interface CreateModulePayload {
  title: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateModulePayload {
  title?: string;
  description?: string;
  prerequisiteModuleId?: string | null;
}

export interface ReorderPayload {
  moduleIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ModulesApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all modules for a course
   */
  list(courseId: string): Observable<CourseModule[]> {
    return this.api.get<CourseModule[]>(`/courses/${courseId}/modules`);
  }

  /**
   * Create a new module
   */
  create(courseId: string, data: CreateModulePayload): Observable<CourseModule> {
    return this.api.post<CourseModule>(`/courses/${courseId}/modules`, data);
  }

  /**
   * Update a module
   */
  update(courseId: string, id: string, data: UpdateModulePayload): Observable<CourseModule> {
    return this.api.put<CourseModule>(`/courses/${courseId}/modules/${id}`, data);
  }

  /**
   * Delete a module
   */
  delete(courseId: string, id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/courses/${courseId}/modules/${id}`);
  }

  /**
   * Reorder modules
   */
  reorder(courseId: string, moduleIds: string[]): Observable<CourseModule[]> {
    return this.api.patch<CourseModule[]>(`/courses/${courseId}/modules/reorder`, { moduleIds });
  }
}
