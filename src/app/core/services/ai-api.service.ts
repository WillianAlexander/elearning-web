import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface GeneratedQuizQuestion {
  type: 'multiple_choice' | 'multiple_select' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: number | number[] | boolean;
  explanation?: string;
}

export type GeneratedQuiz = GeneratedQuizQuestion[];

export interface GenerateQuizPayload {
  questionCount?: number;
}

export interface GenerateOutlinePayload {
  prompt?: string;
}

export interface GenerateContentPayload {
  prompt: string;
  type: 'text' | 'quiz' | 'outline';
}

@Injectable({
  providedIn: 'root',
})
export class AiApiService {
  private readonly api = inject(ApiClient);

  /**
   * Generate quiz questions for a lesson
   */
  generateQuiz(lessonId: string, prompt?: string): Observable<GeneratedQuiz> {
    return this.api.post<GeneratedQuiz>(`/lessons/${lessonId}/generate-quiz`, { prompt });
  }

  /**
   * Generate course outline
   */
  generateOutline(courseId: string, prompt?: string): Observable<any> {
    return this.api.post<any>(`/courses/${courseId}/generate-outline`, { prompt });
  }

  /**
   * Generate content (text/quiz/outline)
   */
  generateContent(prompt: string, type: 'text' | 'quiz' | 'outline'): Observable<any> {
    return this.api.post<any>('/ai/generate', { prompt, type });
  }
}
