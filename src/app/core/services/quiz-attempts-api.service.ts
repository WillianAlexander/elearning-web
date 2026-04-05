import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface QuizAttempt {
  id: string;
  enrollmentId: string;
  contentBlockId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface QuizSummary {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  passed: boolean;
}

export interface SubmitQuizPayload {
  contentBlockId: string;
  answers: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class QuizAttemptsApiService {
  private readonly api = inject(ApiClient);

  /**
   * Submit a quiz attempt
   */
  submit(enrollmentId: string, payload: SubmitQuizPayload): Observable<QuizAttempt> {
    return this.api.post<QuizAttempt>(`/enrollments/${enrollmentId}/quizzes`, payload);
  }

  /**
   * Get quiz attempts for a specific content block
   */
  list(enrollmentId: string, contentBlockId: string): Observable<QuizAttempt[]> {
    return this.api.get<QuizAttempt[]>(`/enrollments/${enrollmentId}/quizzes/${contentBlockId}`);
  }

  /**
   * Get quiz summary for a specific content block
   */
  getSummary(enrollmentId: string, contentBlockId: string): Observable<QuizSummary> {
    return this.api.get<QuizSummary>(
      `/enrollments/${enrollmentId}/quizzes/${contentBlockId}/summary`,
    );
  }

  /**
   * Get best attempt for a specific content block
   */
  getBest(enrollmentId: string, contentBlockId: string): Observable<QuizAttempt | null> {
    return this.api.get<QuizAttempt | null>(
      `/enrollments/${enrollmentId}/quizzes/${contentBlockId}/best`,
    );
  }

  /**
   * Get a specific attempt
   */
  getAttempt(enrollmentId: string, attemptId: string): Observable<QuizAttempt> {
    return this.api.get<QuizAttempt>(`/enrollments/${enrollmentId}/quizzes/attempts/${attemptId}`);
  }
}
