import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Upload a file with progress tracking
   */
  upload(file: File, onProgress?: (percent: number) => void): Observable<MediaFile> {
    return new Observable<MediaFile>((observer) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText) as { data: MediaFile };
          observer.next(response.data);
          observer.complete();
        } else {
          observer.error(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        observer.error(new Error('Upload failed'));
      });

      const token = localStorage.getItem('lms_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.open('POST', `${this.baseUrl}/media/upload`);
      xhr.send(formData);

      return () => {
        xhr.abort();
      };
    });
  }

  /**
   * Get presigned URL for a file
   */
  getPresignedUrl(id: string): Observable<string> {
    return this.http
      .get<{ data: { url: string } }>(`${this.baseUrl}/media/${id}/url`)
      .pipe(map((response) => response.data.url));
  }

  /**
   * Delete a media file
   */
  delete(id: string): Observable<void> {
    return this.http
      .delete<{ data: void }>(`${this.baseUrl}/media/${id}`)
      .pipe(map(() => undefined));
  }
}
