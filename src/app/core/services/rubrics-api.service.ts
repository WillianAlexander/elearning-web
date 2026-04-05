import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface Rubric {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  criteria: RubricCriterion[];
  createdAt: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description?: string;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

export interface RubricEvaluationResult {
  id: string;
  rubricId: string;
  enrollmentId: string;
  score: number;
  feedback?: string;
  evaluatedAt: string;
  evaluator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateRubricPayload {
  title: string;
  description?: string;
  criteria: Omit<RubricCriterion, 'id'>[];
}

export interface UpdateRubricPayload {
  title?: string;
  description?: string;
  criteria?: Omit<RubricCriterion, 'id'>[];
}

export interface CreateRubricEvaluationPayload {
  enrollmentId: string;
  scores: Record<string, number>;
  feedback?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RubricsApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all rubrics for a course
   */
  list(courseId: string): Observable<Rubric[]> {
    return this.api.get<Rubric[]>(`/courses/${courseId}/rubrics`);
  }

  /**
   * Get a rubric by ID
   */
  get(courseId: string, rubricId: string): Observable<Rubric> {
    return this.api.get<Rubric>(`/courses/${courseId}/rubrics/${rubricId}`);
  }

  /**
   * Create a rubric
   */
  create(courseId: string, data: CreateRubricPayload): Observable<Rubric> {
    return this.api.post<Rubric>(`/courses/${courseId}/rubrics`, data);
  }

  /**
   * Update a rubric
   */
  update(courseId: string, rubricId: string, data: UpdateRubricPayload): Observable<Rubric> {
    return this.api.put<Rubric>(`/courses/${courseId}/rubrics/${rubricId}`, data);
  }

  /**
   * Delete a rubric
   */
  delete(courseId: string, rubricId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/courses/${courseId}/rubrics/${rubricId}`);
  }

  /**
   * Submit an evaluation
   */
  submitEvaluation(
    courseId: string,
    rubricId: string,
    data: CreateRubricEvaluationPayload,
  ): Observable<RubricEvaluationResult> {
    return this.api.post<RubricEvaluationResult>(
      `/courses/${courseId}/rubrics/${rubricId}/evaluate`,
      data,
    );
  }

  /**
   * Get evaluation for a specific enrollment
   */
  getEvaluation(
    courseId: string,
    rubricId: string,
    enrollmentId: string,
  ): Observable<RubricEvaluationResult | null> {
    return this.api.get<RubricEvaluationResult | null>(
      `/courses/${courseId}/rubrics/${rubricId}/evaluations/${enrollmentId}`,
    );
  }

  /**
   * Get all evaluations for an enrollment
   */
  getEnrollmentEvaluations(enrollmentId: string): Observable<RubricEvaluationResult[]> {
    return this.api.get<RubricEvaluationResult[]>(`/rubrics/enrollment/${enrollmentId}`);
  }
}
