import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  contentBlocks?: any[];
}

export interface CreateLessonPayload {
  title: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LessonsApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all lessons for a module
   */
  list(courseId: string, moduleId: string): Observable<Lesson[]> {
    return this.api.get<Lesson[]>(`/courses/${courseId}/modules/${moduleId}/lessons`);
  }

  /**
   * Create a new lesson
   */
  create(courseId: string, moduleId: string, data: CreateLessonPayload): Observable<Lesson> {
    return this.api.post<Lesson>(`/courses/${courseId}/modules/${moduleId}/lessons`, data);
  }

  /**
   * Update a lesson
   */
  update(
    courseId: string,
    moduleId: string,
    id: string,
    data: UpdateLessonPayload,
  ): Observable<Lesson> {
    return this.api.put<Lesson>(`/courses/${courseId}/modules/${moduleId}/lessons/${id}`, data);
  }

  /**
   * Delete a lesson
   */
  delete(courseId: string, moduleId: string, id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${id}`,
    );
  }

  /**
   * Reorder lessons
   */
  reorder(courseId: string, moduleId: string, lessonIds: string[]): Observable<Lesson[]> {
    return this.api.patch<Lesson[]>(`/courses/${courseId}/modules/${moduleId}/lessons/reorder`, {
      lessonIds,
    });
  }
}
