import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MediaFile {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

@Component({
  selector: 'app-media-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'flex items-center gap-3 rounded-md border border-border p-3 ' + (className() ?? '')"
    >
      @if (isImage() && media().url) {
        <img
          [src]="media().url"
          [alt]="media().originalName"
          class="h-12 w-12 rounded object-cover"
        />
      } @else {
        <div class="flex h-12 w-12 items-center justify-center rounded bg-bg text-muted">
          @switch (media().mimeType.split('/')[0]) {
            @case ('image') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            }
            @case ('video') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            }
            @default {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            }
          }
        </div>
      }
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-dark">
          {{ media().originalName }}
        </p>
        <p class="text-xs text-muted">{{ formatSize(media().size) }}</p>
      </div>
    </div>
  `,
})
export class MediaPreviewComponent {
  readonly media = input.required<MediaFile>();
  readonly className = input<string>('');

  isImage(): boolean {
    return this.media().mimeType.startsWith('image/');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
