import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, SearchParams } from './api-client.service';
import { Course, Lesson } from '../types';
import { PaginatedResult } from '../types/api-envelope';

export interface CourseFilters extends SearchParams {
  categoryId?: string;
  difficulty?: string;
  instructorId?: string;
  isEnrolled?: string;
}

export interface CourseWithProgress extends Course {
  progress?: number;
  enrollmentStatus?: string;
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  difficulty?: string;
  tags?: string[];
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {}

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private readonly api = inject(ApiClient);

  /**
   * Get all courses with pagination and filters
   */
  getCourses(filters?: CourseFilters): Observable<PaginatedResult<Course>> {
    return this.api.getPaginated<Course>('/courses', filters);
  }

  /**
   * Get course by ID
   */
  getCourseById(id: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${id}`);
  }

  /**
   * Get course by slug
   */
  getCourseBySlug(slug: string): Observable<Course> {
    return this.api.get<Course>(`/courses/slug/${slug}`);
  }

  /**
   * Get enrolled courses with progress
   */
  getMyCourses(filters?: CourseFilters): Observable<PaginatedResult<CourseWithProgress>> {
    return this.api.getPaginated<CourseWithProgress>('/courses/enrolled', filters);
  }

  /**
   * Get course curriculum (modules and lessons)
   */
  getCourseCurriculum(courseId: string): Observable<any> {
    return this.api.get<any>(`/courses/${courseId}/modules`);
  }

  /**
   * Get lesson by ID
   */
  getLesson(lessonId: string): Observable<Lesson> {
    return this.api.get<Lesson>(`/lessons/${lessonId}`);
  }

  /**
   * Get categories for course filtering (C-09/I-14 fix: use /categories endpoint)
   */
  getCategories(): Observable<any[]> {
    return this.api.get<any[]>('/categories');
  }

  /**
   * Search courses
   */
  searchCourses(
    query: string,
    filters?: Omit<CourseFilters, 'search'>,
  ): Observable<PaginatedResult<Course>> {
    return this.api.getPaginated<Course>('/courses/search', { search: query, ...filters });
  }

  /**
   * Get featured/recommended courses
   */
  getFeaturedCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses/featured');
  }

  /**
   * Get popular courses
   */
  getPopularCourses(limit = 10): Observable<Course[]> {
    return this.api.get<Course[]>('/courses/popular', { limit });
  }

  /**
   * Rate a course
   */
  rateCourse(courseId: string, rating: number, comment?: string): Observable<void> {
    return this.api.post<void>(`/courses/${courseId}/ratings`, { rating, comment });
  }

  /**
   * Get course reviews
   */
  getCourseReviews(courseId: string, page = 1, pageSize = 10): Observable<PaginatedResult<any>> {
    return this.api.getPaginated<any>(`/courses/${courseId}/reviews`, { page, pageSize });
  }

  /**
   * Create a new course
   */
  createCourse(data: CreateCoursePayload): Observable<Course> {
    return this.api.post<Course>('/courses', data);
  }

  /**
   * Update a course
   */
  updateCourse(id: string, data: UpdateCoursePayload): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}`, data);
  }

  /**
   * Delete a course
   */
  deleteCourse(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/courses/${id}`);
  }

  /**
   * Request review for a course
   */
  requestReview(id: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/request-review`, {});
  }

  /**
   * Approve/publish a course
   */
  approveCourse(id: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/publish`, {});
  }

  /**
   * Reject a course
   */
  rejectCourse(id: string, reason: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/reject`, { reason });
  }

  /**
   * Archive a course
   */
  archiveCourse(id: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/archive`, {});
  }
}
