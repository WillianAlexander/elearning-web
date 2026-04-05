import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CertificateInfo {
  enrollmentId: string;
  courseName: string;
  userName: string;
  completedAt: string;
  issuedAt: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificatesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Download completion certificate as PDF
   */
  download(enrollmentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/enrollments/${enrollmentId}/certificate`, {
      responseType: 'blob',
    });
  }

  /**
   * Verify certificate by code
   */
  verify(code: string): Observable<CertificateInfo> {
    return this.http
      .get<{ data: CertificateInfo }>(`${this.baseUrl}/enrollments/certificates/verify/${code}`)
      .pipe(map((response) => response.data));
  }
}
