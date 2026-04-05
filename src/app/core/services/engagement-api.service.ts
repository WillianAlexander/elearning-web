import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface HeatmapEntry {
  date: string;
  count: number;
  minutes: number;
}

export interface VideoWatchLog {
  id: string;
  contentBlockId: string;
  watchedSeconds: number;
  totalDuration: number;
  position: number;
  createdAt: string;
}

export interface VideoHeartbeatPayload {
  lessonId: string;
  contentBlockId: string;
  watchedSeconds: number;
  totalDuration: number;
  position: number;
}

export interface ActivitySummary {
  totalMinutes: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  averageDailyMinutes: number;
  streakDays: number;
}

@Injectable({
  providedIn: 'root',
})
export class EngagementApiService {
  private readonly api = inject(ApiClient);

  /**
   * Get activity heatmap data
   */
  getHeatmap(months = 6): Observable<HeatmapEntry[]> {
    return this.api.get<HeatmapEntry[]>(`/engagement/heatmap`, { months });
  }

  /**
   * Get activity summary
   */
  getActivitySummary(from?: string, to?: string): Observable<ActivitySummary> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.api.get<ActivitySummary>('/engagement/summary', params);
  }

  /**
   * Track video progress (heartbeat)
   */
  trackVideoProgress(
    contentBlockId: string,
    watchedSeconds: number,
    totalSeconds: number,
    position: number,
  ): Observable<VideoWatchLog> {
    return this.api.post<VideoWatchLog>('/engagement/video-watch', {
      contentBlockId,
      watchedSeconds,
      totalDuration: totalSeconds,
      position,
    });
  }

  /**
   * Get video watch logs for a lesson
   */
  getVideoLogs(lessonId: string): Observable<VideoWatchLog[]> {
    return this.api.get<VideoWatchLog[]>(`/engagement/video-watch/lesson/${lessonId}`);
  }

  /**
   * Recalculate effort estimation for a lesson
   */
  recalculateEffort(lessonId: string): Observable<any> {
    return this.api.post<any>(`/lessons/${lessonId}/estimate`, {});
  }
}
