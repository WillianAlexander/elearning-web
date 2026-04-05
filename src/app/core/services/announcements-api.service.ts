import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all announcements for a course
   */
  list(courseId: string): Observable<Announcement[]> {
    return this.api.get<Announcement[]>(`/courses/${courseId}/announcements`);
  }

  /**
   * Create an announcement
   */
  create(courseId: string, data: CreateAnnouncementPayload): Observable<Announcement> {
    return this.api.post<Announcement>(`/courses/${courseId}/announcements`, data);
  }

  /**
   * Update an announcement
   */
  update(
    courseId: string,
    announcementId: string,
    data: UpdateAnnouncementPayload,
  ): Observable<Announcement> {
    return this.api.put<Announcement>(`/courses/${courseId}/announcements/${announcementId}`, data);
  }

  /**
   * Delete an announcement
   */
  delete(courseId: string, announcementId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(
      `/courses/${courseId}/announcements/${announcementId}`,
    );
  }
}
