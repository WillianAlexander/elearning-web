import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient, SearchParams } from './api-client.service';
import { Enrollment } from '../types';
import { PaginatedResult } from '../types/api-envelope';

export interface EnrollmentFilters extends SearchParams {
  status?: string;
  courseId?: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  course?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    estimatedDuration?: number;
  };
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpent?: number;
}

export interface CourseProgress {
  courseId: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastActivityAt?: string;
  isCompleted: boolean;
}

export interface BulkEnrollPayload {
  userIds: string[];
  courseId: string;
}

export interface BulkEnrollResult {
  successful: string[];
  failed: { userId: string; reason: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  private readonly api = inject(ApiClient);

  /**
   * Get my enrollments (C-10 fix: use /enrollments/my)
   */
  getMyEnrollments(filters?: EnrollmentFilters): Observable<PaginatedResult<EnrollmentWithCourse>> {
    return this.api.getPaginated<EnrollmentWithCourse>(
      '/enrollments/my',
      filters as Record<string, string>,
    );
  }

  /**
   * Get my enrollments as array (for simple lists)
   */
  getMyEnrollmentsList(): Observable<EnrollmentWithCourse[]> {
    return this.api.get<EnrollmentWithCourse[]>('/enrollments/my');
  }

  /**
   * Get enrollments list (admin/instructor)
   */
  getEnrollments(filters?: EnrollmentFilters): Observable<PaginatedResult<EnrollmentWithCourse>> {
    return this.api.getPaginated<EnrollmentWithCourse>(
      '/enrollments',
      filters as Record<string, string>,
    );
  }

  /**
   * Get enrollment by ID
   */
  getEnrollmentById(id: string): Observable<EnrollmentWithCourse> {
    return this.api.get<EnrollmentWithCourse>(`/enrollments/${id}`);
  }

  /**
   * Get enrollments for a course
   */
  getCourseEnrollments(
    courseId: string,
    filters?: EnrollmentFilters,
  ): Observable<PaginatedResult<Enrollment>> {
    return this.api.getPaginated<Enrollment>(
      `/courses/${courseId}/enrollments`,
      filters as Record<string, string>,
    );
  }

  /**
   * Enroll in a course
   */
  enroll(courseId: string): Observable<Enrollment> {
    return this.api.post<Enrollment>('/enrollments', { courseId });
  }

  /**
   * Enroll in a course (alias for backward compatibility)
   */
  enrollInCourse(courseId: string): Observable<Enrollment> {
    return this.enroll(courseId);
  }

  /**
   * Unenroll from a course
   */
  unenroll(enrollmentId: string): Observable<Enrollment> {
    return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/drop`, {});
  }

  /**
   * Bulk enroll users (admin)
   */
  bulkEnroll(payload: BulkEnrollPayload): Observable<BulkEnrollResult> {
    return this.api.post<BulkEnrollResult>('/enrollments/bulk', payload);
  }

  /**
   * Get progress for an enrollment
   */
  getProgress(enrollmentId: string): Observable<LessonProgress[]> {
    return this.api.get<LessonProgress[]>(`/enrollments/${enrollmentId}/progress`);
  }

  /**
   * Update enrollment status
   */
  updateEnrollmentStatus(enrollmentId: string, status: string): Observable<Enrollment> {
    return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/status`, { status });
  }

  /**
   * Get course progress
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return this.api.get<CourseProgress>(`/enrollments/course/${courseId}/progress`);
  }

  /**
   * Update lesson progress
   */
  updateLessonProgress(
    courseId: string,
    lessonId: string,
    data: Partial<LessonProgress>,
  ): Observable<void> {
    return this.api.post<void>(
      `/enrollments/course/${courseId}/lessons/${lessonId}/progress`,
      data,
    );
  }

  /**
   * Mark lesson as complete
   */
  completeLesson(courseId: string, lessonId: string): Observable<void> {
    return this.api.post<void>(`/enrollments/course/${courseId}/lessons/${lessonId}/complete`, {});
  }

  /**
   * Mark lesson as incomplete
   */
  uncompleteLesson(courseId: string, lessonId: string): Observable<void> {
    return this.api.delete<void>(`/enrollments/course/${courseId}/lessons/${lessonId}/complete`);
  }

  /**
   * Get overall learning progress
   */
  getOverallProgress(): Observable<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalProgress: number;
  }> {
    return this.api.get<any>('/enrollments/overall-progress');
  }

  /**
   * Get recently viewed courses
   */
  getRecentlyViewed(limit = 5): Observable<EnrollmentWithCourse[]> {
    return this.api.get<EnrollmentWithCourse[]>('/enrollments/recent', { limit });
  }

  /**
   * Check if user is enrolled in course
   */
  isEnrolledInCourse(courseId: string): Observable<boolean> {
    return this.api
      .get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`)
      .pipe(map((result) => result.enrolled));
  }

  /**
   * Verify certificate
   */
  verifyCertificate(code: string): Observable<any> {
    return this.api.get<any>(`/enrollments/certificates/verify/${code}`);
  }
}
