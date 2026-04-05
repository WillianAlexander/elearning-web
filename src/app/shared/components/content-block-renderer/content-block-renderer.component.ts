import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuizViewerComponent } from '../quiz-viewer/quiz-viewer.component';

export interface ContentBlock {
  id: string;
  lessonId: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

@Component({
  selector: 'app-content-block-renderer',
  standalone: true,
  imports: [CommonModule, QuizViewerComponent],
  template: `
    @switch (block().type) {
      @case ('text') {
        <div class="prose prose-sm max-w-none text-dark" [innerHTML]="getTextHtml()"></div>
      }
      @case ('video') {
        <div class="aspect-video overflow-hidden rounded-lg bg-slate-900 shadow-sm">
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
        <div class="overflow-hidden rounded-lg">
          <img [src]="getImageUrl()" [alt]="getImageAlt()" class="max-w-full" />
        </div>
      }
      @case ('pdf') {
        <div class="rounded-lg border border-border p-4">
          <a
            [href]="getPdfUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-primary hover:text-primary/80"
          >
            <span class="material-symbols-outlined text-lg mr-2 text-red-600">picture_as_pdf</span>
            Ver PDF: {{ getPdfName() }}
          </a>
        </div>
      }
      @case ('code') {
        <pre class="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code>{{ getCodeContent() }}</code>
        </pre>
      }
      @case ('embed') {
        @if (getEmbedUrl()) {
          <div class="aspect-video overflow-hidden rounded-lg shadow-sm">
            <iframe
              [src]="getSafeEmbedUrl()"
              title="Contenido embebido"
              allow="autoplay; encrypted-media"
              allowfullscreen
              class="h-full w-full border-0"
            ></iframe>
          </div>
        }
      }
      @case ('audio') {
        @if (getAudioUrl()) {
          <div class="rounded-lg border border-border bg-bg p-3">
            <audio [src]="getAudioUrl()" controls class="w-full" preload="metadata">
              Tu navegador no soporta audio HTML5.
            </audio>
          </div>
        }
      }
      @case ('quiz') {
        <app-quiz-viewer [content]="getQuizContent()" (quizSubmitted)="onQuizSubmitted($event)" />
      }
      @default {
        <div class="rounded-lg border border-border bg-bg p-4 text-sm text-muted">
          Tipo de contenido no soportado: {{ block().type }}
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
export class ContentBlockRendererComponent {
  readonly block = input.required<ContentBlock>();
  readonly editMode = input<boolean>(false);
  readonly enrollmentId = input<string | undefined>(undefined);

  constructor(private sanitizer: DomSanitizer) {}

  private getContent(): Record<string, unknown> {
    return this.block().content as Record<string, unknown>;
  }

  getTextHtml(): string {
    return (this.getContent()['html'] as string) ?? '';
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
    return (this.getContent()['alt'] as string) ?? 'Imagen';
  }

  getPdfUrl(): string {
    return (this.getContent()['url'] as string) ?? '';
  }

  getPdfName(): string {
    return (this.getContent()['name'] as string) ?? 'Documento';
  }

  getCodeContent(): string {
    return (this.getContent()['code'] as string) ?? '';
  }

  getEmbedUrl(): string {
    return (this.getContent()['url'] as string) ?? '';
  }

  getSafeEmbedUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl());
  }

  getAudioUrl(): string {
    return (this.getContent()['url'] as string) ?? '';
  }

  getQuizContent(): Record<string, unknown> {
    return this.getContent();
  }

  onQuizSubmitted(answers: unknown): void {
    // Handle quiz submission - could emit to parent
    console.log('Quiz submitted:', answers);
  }
}
