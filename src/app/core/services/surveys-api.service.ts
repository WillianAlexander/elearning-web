import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface SurveyTemplate {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  createdAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
}

export interface CreateSurveyTemplatePayload {
  courseId: string;
  title: string;
  description?: string;
  questions: Omit<SurveyQuestion, 'id'>[];
}

export interface SurveyResponseItem {
  id: string;
  templateId: string;
  enrollmentId: string;
  answers: Record<string, string | number>;
  submittedAt: string;
}

export interface SubmitSurveyResponsePayload {
  templateId: string;
  enrollmentId: string;
  answers: Record<string, string | number>;
}

@Injectable({
  providedIn: 'root',
})
export class SurveysApiService {
  private readonly api = inject(ApiClient);

  /**
   * Get survey template for a course
   */
  getTemplate(courseId: string): Observable<SurveyTemplate | null> {
    return this.api.get<SurveyTemplate | null>(`/surveys/templates/course/${courseId}`);
  }

  /**
   * Get survey template by ID
   */
  getTemplateById(templateId: string): Observable<SurveyTemplate> {
    return this.api.get<SurveyTemplate>(`/surveys/templates/${templateId}`);
  }

  /**
   * Create a survey template
   */
  createTemplate(data: CreateSurveyTemplatePayload): Observable<SurveyTemplate> {
    return this.api.post<SurveyTemplate>('/surveys/templates', data);
  }

  /**
   * Submit a survey response
   */
  submitResponse(payload: SubmitSurveyResponsePayload): Observable<SurveyResponseItem> {
    return this.api.post<SurveyResponseItem>('/surveys/responses', payload);
  }

  /**
   * Get responses for a template
   */
  getResponses(templateId: string): Observable<SurveyResponseItem[]> {
    return this.api.get<SurveyResponseItem[]>(`/surveys/responses/template/${templateId}`);
  }

  /**
   * Get responses for an enrollment
   */
  getResponsesByEnrollment(enrollmentId: string): Observable<SurveyResponseItem[]> {
    return this.api.get<SurveyResponseItem[]>(`/surveys/responses/enrollment/${enrollmentId}`);
  }
}
