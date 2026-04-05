import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface ContentBlock {
  id: string;
  lessonId: string;
  type: string;
  order: number;
  content: any;
}

export interface ContentVersion {
  id: string;
  contentBlockId: string;
  version: number;
  content: any;
  createdAt: string;
}

export interface CreateContentBlockPayload {
  type: string;
  content: any;
}

export interface UpdateContentBlockPayload {
  content?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ContentBlocksApiService {
  private readonly api = inject(ApiClient);

  /**
   * List all content blocks for a lesson
   */
  list(lessonId: string): Observable<ContentBlock[]> {
    return this.api.get<ContentBlock[]>(`/lessons/${lessonId}/blocks`);
  }

  /**
   * Create a new content block
   */
  create(lessonId: string, data: CreateContentBlockPayload): Observable<ContentBlock> {
    return this.api.post<ContentBlock>(`/lessons/${lessonId}/blocks`, data);
  }

  /**
   * Update a content block
   */
  update(lessonId: string, id: string, data: UpdateContentBlockPayload): Observable<ContentBlock> {
    return this.api.put<ContentBlock>(`/lessons/${lessonId}/blocks/${id}`, data);
  }

  /**
   * Delete a content block
   */
  delete(lessonId: string, id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/lessons/${lessonId}/blocks/${id}`);
  }

  /**
   * Reorder content blocks
   */
  reorder(lessonId: string, blockIds: string[]): Observable<ContentBlock[]> {
    return this.api.patch<ContentBlock[]>(`/lessons/${lessonId}/blocks/reorder`, { blockIds });
  }

  /**
   * List versions for a lesson's content blocks
   */
  listVersions(lessonId: string): Observable<ContentVersion[]> {
    return this.api.get<ContentVersion[]>(`/lessons/${lessonId}/blocks/versions`);
  }

  /**
   * Create a new version snapshot
   */
  createVersion(lessonId: string): Observable<ContentVersion> {
    return this.api.post<ContentVersion>(`/lessons/${lessonId}/blocks/versions`, {});
  }
}
