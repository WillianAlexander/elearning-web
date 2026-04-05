import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContentBlock } from '../content-block-renderer/content-block-renderer.component';

@Component({
  selector: 'app-hero-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (heroBlock()?.type) {
      @case ('video') {
        <div class="aspect-video w-full shrink-0 bg-slate-900">
          @if (getYoutubeId()) {
            <iframe
              [src]="getYoutubeEmbedUrl()"
              title="Video de YouTube"
              allow="autoplay; encrypted-media"
              allowfullscreen
              class="h-full w-full border-0"
            ></iframe>
          } @else {
            <video [src]="getVideoUrl()" controls class="h-full w-full"></video>
          }
        </div>
      }
      @case ('image') {
        <div class="relative w-full shrink-0">
          <img
            [src]="getImageUrl()"
            [alt]="getImageAlt()"
            class="max-h-[400px] w-full object-cover"
          />
        </div>
      }
      @default {
        <div
          class="flex w-full shrink-0 items-center justify-center bg-gradient-to-br from-gray-800 to-primary px-8 py-12"
        >
          <div class="text-center">
            @if (courseTitle()) {
              <p class="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
                {{ courseTitle() }}
              </p>
            }
            <h2 class="text-2xl font-bold text-white sm:text-3xl">
              {{ lessonTitle() || 'Lección' }}
            </h2>
          </div>
        </div>
      }
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
export class HeroZoneComponent {
  readonly heroBlock = input<ContentBlock | undefined>();
  readonly courseTitle = input<string | undefined>(undefined);
  readonly lessonTitle = input<string | undefined>(undefined);

  constructor(private sanitizer: DomSanitizer) {}

  private getContent(): Record<string, unknown> {
    return (this.heroBlock()?.content as Record<string, unknown>) || {};
  }

  getVideoUrl(): string {
    return (this.getContent()['url'] as string) ?? '';
  }

  getYoutubeId(): string | null {
    const url = this.getVideoUrl();
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

  getYoutubeEmbedUrl(): SafeResourceUrl {
    const id = this.getYoutubeId();
    if (id) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
    }
    return '' as SafeResourceUrl;
  }

  getImageUrl(): string {
    return (this.getContent()['url'] as string) ?? '';
  }

  getImageAlt(): string {
    return (this.getContent()['alt'] as string) ?? 'Imagen de lección';
  }
}
