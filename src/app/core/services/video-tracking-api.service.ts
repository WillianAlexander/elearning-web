import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface VideoTrackingEntry {
  id: string;
  contentBlockId: string;
  watchedSeconds: number;
  totalDuration: number;
  position: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoTrackingApiService {
  private readonly api = inject(ApiClient);

  /**
   * Track video watch progress
   */
  track(
    contentBlockId: string,
    watchedSeconds: number,
    totalSeconds: number,
    position: number,
  ): Observable<VideoTrackingEntry> {
    return this.api.post<VideoTrackingEntry>('/engagement/video-watch', {
      contentBlockId,
      watchedSeconds,
      totalDuration: totalSeconds,
      position,
    });
  }

  /**
   * Get video tracking log for a content block
   */
  getLog(contentBlockId: string): Observable<VideoTrackingEntry[]> {
    return this.api.get<VideoTrackingEntry[]>(`/engagement/video-watch/block/${contentBlockId}`);
  }
}
