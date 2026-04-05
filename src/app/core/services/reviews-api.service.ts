import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CourseReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all reviews for a course
   */
  list(courseId: string): Observable<CourseReview[]> {
    return this.api.get<CourseReview[]>(`/courses/${courseId}/reviews`);
  }

  /**
   * Create a review for a course
   */
  create(courseId: string, data: CreateReviewPayload): Observable<CourseReview> {
    return this.api.post<CourseReview>(`/courses/${courseId}/reviews`, data);
  }

  /**
   * Update a review
   */
  update(courseId: string, reviewId: string, data: UpdateReviewPayload): Observable<CourseReview> {
    return this.api.put<CourseReview>(`/courses/${courseId}/reviews/${reviewId}`, data);
  }

  /**
   * Delete a review
   */
  delete(courseId: string, reviewId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/courses/${courseId}/reviews/${reviewId}`);
  }

  /**
   * Get review summary for a course
   */
  getSummary(courseId: string): Observable<CourseReviewSummary> {
    return this.api.get<CourseReviewSummary>(`/courses/${courseId}/reviews/summary`);
  }
}
