import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface VideoBlockContent {
  mediaId?: string;
  url?: string;
}

@Component({
  selector: 'app-video-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (content().url) {
      <div class="overflow-hidden rounded-md border border-border">
        @if (getYoutubeId()) {
          <div class="aspect-video">
            <iframe
              [src]="getYoutubeEmbedUrl()"
              title="Vista previa de YouTube"
              allow="autoplay; encrypted-media"
              allowfullscreen
              class="h-full w-full border-0"
            ></iframe>
          </div>
        } @else {
          <video [src]="content().url" controls class="w-full" preload="metadata">
            Tu navegador no soporta video HTML5.
          </video>
        }
        <div class="flex items-center justify-between bg-gray-50 px-3 py-1.5">
          <span class="text-xs text-muted">
            {{ getYoutubeId() ? 'Video de YouTube' : 'Video cargado' }}
          </span>
          <button
            type="button"
            (click)="clearVideo()"
            class="text-xs text-red-600 hover:text-red-700"
          >
            Reemplazar
          </button>
        </div>
      </div>
    } @else {
      <div class="space-y-4">
        <div class="rounded-md border border-dashed border-border p-6 text-center">
          <span class="material-symbols-outlined text-3xl text-muted mb-2">videocam</span>
          <p class="text-sm text-muted mb-2">Arrastra un video aquí o haz clic para seleccionar</p>
          <input
            type="file"
            accept="video/*"
            (change)="onFileSelect($event)"
            class="hidden"
            #fileInput
          />
          <button
            type="button"
            (click)="fileInput.click()"
            class="text-sm text-primary hover:text-primary/80"
          >
            Seleccionar archivo
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-border"></div>
          <span class="text-xs text-muted/60">o</span>
          <div class="h-px flex-1 bg-border"></div>
        </div>

        <div class="space-y-2">
          <label for="youtube-url" class="block text-sm font-medium text-dark">
            URL de video (YouTube)
          </label>
          <div class="flex gap-2">
            <input
              id="youtube-url"
              type="url"
              [(ngModel)]="youtubeInput"
              placeholder="https://www.youtube.com/watch?v=..."
              class="flex-1 rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              (click)="addYouTubeVideo()"
              [disabled]="!youtubeInput.trim()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
          @if (youtubeError()) {
            <p class="text-xs text-red-600">{{ youtubeError() }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class VideoBlockComponent {
  readonly content = input.required<VideoBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  youtubeInput = '';
  youtubeError = signal('');

  getYoutubeId(): string | null {
    const url = this.content().url;
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  getYoutubeEmbedUrl(): string {
    const id = this.getYoutubeId();
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
    return '';
  }

  clearVideo(): void {
    this.contentUpdate.emit({ mediaId: null, url: null });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      // In a real app, this would upload the file
      const url = URL.createObjectURL(file);
      this.contentUpdate.emit({ mediaId: 'uploaded', url });
    }
  }

  addYouTubeVideo(): void {
    const url = this.youtubeInput.trim();
    if (!url) return;

    const id = this.extractYouTubeId(url);
    if (!id) {
      this.youtubeError.set(
        'URL de YouTube no válida. Usa un enlace como https://youtube.com/watch?v=...',
      );
      return;
    }

    this.youtubeError.set('');
    this.contentUpdate.emit({ url: this.youtubeInput.trim() });
    this.youtubeInput = '';
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
