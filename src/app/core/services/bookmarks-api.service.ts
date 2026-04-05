import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface Bookmark {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  createdAt: string;
}

export interface ToggleBookmarkPayload {
  lessonId: string;
}

export interface ToggleBookmarkResult {
  bookmarked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BookmarksApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all bookmarks for the current user
   */
  list(): Observable<Bookmark[]> {
    return this.api.get<Bookmark[]>('/bookmarks');
  }

  /**
   * List bookmarks for a specific course
   */
  listByCourse(courseId: string): Observable<Bookmark[]> {
    return this.api.get<Bookmark[]>(`/bookmarks/course/${courseId}`);
  }

  /**
   * Toggle bookmark on a lesson
   */
  toggle(lessonId: string): Observable<ToggleBookmarkResult> {
    return this.api.post<ToggleBookmarkResult>('/bookmarks/toggle', { lessonId });
  }

  /**
   * Check if a lesson is bookmarked
   */
  isBookmarked(lessonId: string): Observable<boolean> {
    return this.api.get<boolean>(`/bookmarks/lesson/${lessonId}`);
  }
}
