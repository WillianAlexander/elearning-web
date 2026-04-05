import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PdfBlockContent {
  mediaId?: string;
  fileName?: string;
  url?: string;
}

@Component({
  selector: 'app-pdf-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (content().url && content().fileName) {
      <div class="flex items-center gap-3 rounded-md border border-border bg-gray-50 p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded bg-red-100 text-red-600">
          <span class="material-symbols-outlined text-xl">picture_as_pdf</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-dark">
            {{ content().fileName }}
          </p>
          <a
            [href]="content().url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-primary hover:text-primary/80"
          >
            Descargar / Abrir PDF
          </a>
        </div>
        <button type="button" (click)="clearPdf()" class="text-xs text-red-600 hover:text-red-700">
          Eliminar
        </button>
      </div>
    } @else {
      <div class="rounded-md border border-dashed border-border p-6 text-center">
        <span class="material-symbols-outlined text-3xl text-muted mb-2">picture_as_pdf</span>
        <p class="text-sm text-muted mb-2">Arrastra un PDF aquí o haz clic para seleccionar</p>
        <input
          type="file"
          accept=".pdf,application/pdf"
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
export class PdfBlockComponent {
  readonly content = input.required<PdfBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  clearPdf(): void {
    this.contentUpdate.emit({ mediaId: null, fileName: null, url: null });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.contentUpdate.emit({
        mediaId: 'uploaded',
        fileName: file.name,
        url,
      });
    }
  }
}
