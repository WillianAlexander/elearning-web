import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AudioBlockContent {
  mediaId?: string | null;
  url?: string | null;
  title?: string;
}

@Component({
  selector: 'app-audio-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (content().url) {
      <div class="overflow-hidden rounded-md border border-border">
        <audio [src]="content().url!" controls class="w-full" preload="metadata">
          Tu navegador no soporta audio HTML5.
        </audio>
        <div class="flex items-center justify-between bg-gray-50 px-3 py-1.5">
          <span class="truncate text-xs text-muted">
            {{ content().title ?? 'Audio cargado' }}
          </span>
          <button
            type="button"
            (click)="clearAudio()"
            class="ml-2 shrink-0 text-xs text-red-600 hover:text-red-700"
          >
            Reemplazar
          </button>
        </div>
      </div>
    } @else {
      <div class="rounded-md border border-dashed border-border p-6 text-center">
        <span class="material-symbols-outlined text-3xl text-muted mb-2">audiotrack</span>
        <p class="text-sm text-muted mb-2">
          Arrastra un archivo de audio aquí o haz clic para seleccionar
        </p>
        <input
          type="file"
          accept="audio/*"
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
export class AudioBlockComponent {
  readonly content = input.required<AudioBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  clearAudio(): void {
    this.contentUpdate.emit({ mediaId: null, url: null, title: '' });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.contentUpdate.emit({ mediaId: 'uploaded', url, title: file.name });
    }
  }
}
