import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface EmailCampaign {
  id: string;
  courseId: string;
  subject: string;
  body: string;
  targetRole?: string;
  sentAt: string;
  recipientCount: number;
  status: 'pending' | 'sent' | 'failed';
}

export interface SendBulkEmailPayload {
  subject: string;
  body: string;
  targetRole?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BulkEmailApiService {
  private readonly api = inject(ApiClient);

  /**
   * Send bulk email to enrolled users
   */
  send(courseId: string, payload: SendBulkEmailPayload): Observable<EmailCampaign> {
    return this.api.post<EmailCampaign>(`/courses/${courseId}/email`, payload);
  }

  /**
   * Get email campaign history for a course
   */
  getCampaigns(courseId: string): Observable<EmailCampaign[]> {
    return this.api.get<EmailCampaign[]>(`/courses/${courseId}/email/history`);
  }

  /**
   * Get a specific campaign
   */
  getCampaign(courseId: string, campaignId: string): Observable<EmailCampaign> {
    return this.api.get<EmailCampaign>(`/courses/${courseId}/email/${campaignId}`);
  }
}
