import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImageBlockContent {
  mediaId?: string;
  url?: string;
  alt?: string;
}

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (content().url) {
      <div class="overflow-hidden rounded-md border border-border">
        <img
          [src]="content().url"
          [alt]="alt() || 'Imagen del curso'"
          class="w-full object-contain"
        />
        <div class="space-y-2 bg-gray-50 px-3 py-2">
          <div class="flex items-center gap-2">
            <label for="img-alt" class="text-xs text-muted"> Texto alternativo: </label>
            <input
              id="img-alt"
              type="text"
              [value]="alt()"
              (input)="onAltChange($event)"
              placeholder="Describe la imagen..."
              class="flex-1 rounded border border-border px-2 py-1 text-xs focus:border-primary focus:outline-none"
            />
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              (click)="clearImage()"
              class="text-xs text-red-600 hover:text-red-700"
            >
              Reemplazar imagen
            </button>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-md border border-dashed border-border p-6 text-center">
        <span class="material-symbols-outlined text-3xl text-muted mb-2">image</span>
        <p class="text-sm text-muted mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
        <input
          type="file"
          accept="image/*"
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
export class ImageBlockComponent {
  readonly content = input.required<ImageBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  alt = signal('');

  ngOnInit(): void {
    this.alt.set(this.content().alt ?? '');
  }

  onAltChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.alt.set(value);
    this.contentUpdate.emit({ ...this.content(), alt: value });
  }

  clearImage(): void {
    this.alt.set('');
    this.contentUpdate.emit({ mediaId: null, url: null, alt: '' });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.contentUpdate.emit({ mediaId: 'uploaded', url, alt: this.alt() });
    }
  }
}
