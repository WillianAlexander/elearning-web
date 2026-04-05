import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface LessonNote {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveNotePayload {
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotesApiService {
  private readonly api = inject(ApiClient);

  /**
   * Get note for a lesson
   */
  get(lessonId: string): Observable<LessonNote | null> {
    return this.api.get<LessonNote | null>(`/notes/lesson/${lessonId}`);
  }

  /**
   * Create or update a note for a lesson
   */
  upsert(lessonId: string, content: string): Observable<LessonNote> {
    return this.api.put<LessonNote>(`/notes/lesson/${lessonId}`, { content });
  }

  /**
   * Delete a note for a lesson
   */
  delete(lessonId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/notes/lesson/${lessonId}`);
  }
}
