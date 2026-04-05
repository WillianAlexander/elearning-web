import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface EmbedBlockContent {
  url?: string;
  title?: string;
}

@Component({
  selector: 'app-embed-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (content().url) {
      <div class="overflow-hidden rounded-md border border-border">
        <div class="aspect-video">
          <iframe
            [src]="getSafeEmbedUrl()"
            title="Contenido embebido"
            allow="autoplay; encrypted-media"
            allowfullscreen
            class="h-full w-full border-0"
          ></iframe>
        </div>
        <div class="flex items-center justify-between bg-gray-50 px-3 py-1.5">
          <span class="truncate text-xs text-muted">
            {{ content().title ?? content().url }}
          </span>
          <button
            type="button"
            (click)="clearEmbed()"
            class="ml-2 shrink-0 text-xs text-red-600 hover:text-red-700"
          >
            Reemplazar
          </button>
        </div>
      </div>
    } @else {
      <div class="space-y-3 rounded-md border border-border p-4">
        <div class="space-y-2">
          <label for="embed-title" class="block text-sm font-medium text-dark">
            Título (opcional)
          </label>
          <input
            id="embed-title"
            type="text"
            [(ngModel)]="titleInput"
            placeholder="Ej: Presentación del módulo"
            class="w-full rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div class="space-y-2">
          <label for="embed-url" class="block text-sm font-medium text-dark"> URL a embeber </label>
          <div class="flex gap-2">
            <input
              id="embed-url"
              type="url"
              [(ngModel)]="urlInput"
              (keydown.enter)="addEmbed()"
              placeholder="https://www.youtube.com/watch?v=... o https://slides.google.com/..."
              class="flex-1 rounded-md border border-border px-3 py-2 text-sm placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              (click)="addEmbed()"
              [disabled]="!urlInput.trim()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
          @if (urlError()) {
            <p class="text-xs text-red-600">{{ urlError() }}</p>
          }
          <p class="text-xs text-muted/70">
            Soporta YouTube, Google Slides, Vimeo y cualquier URL con iframe.
          </p>
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
export class EmbedBlockComponent {
  readonly content = input.required<EmbedBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  constructor(private sanitizer: DomSanitizer) {}

  urlInput = '';
  titleInput = '';
  urlError = signal('');

  getSafeEmbedUrl(): SafeResourceUrl {
    const url = this.normalizeEmbedUrl(this.content().url || '');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  normalizeEmbedUrl(raw: string): string {
    try {
      const url = new URL(raw.trim());

      // Convert YouTube watch URL to embed URL
      if (
        (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') &&
        url.pathname === '/watch'
      ) {
        const v = url.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }

      // Convert youtu.be short links
      if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1);
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      return raw.trim();
    } catch {
      return raw.trim();
    }
  }

  clearEmbed(): void {
    this.urlInput = '';
    this.titleInput = '';
    this.urlError.set('');
    this.contentUpdate.emit({ url: '', title: '' });
  }

  addEmbed(): void {
    const trimmed = this.urlInput.trim();
    if (!trimmed) return;

    if (!this.isValidUrl(trimmed)) {
      this.urlError.set('URL no válida. Usa un enlace https:// o http://');
      return;
    }

    this.urlError.set('');
    this.contentUpdate.emit({
      url: this.normalizeEmbedUrl(trimmed),
      title: this.titleInput.trim() || undefined,
    });
    this.urlInput = '';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
