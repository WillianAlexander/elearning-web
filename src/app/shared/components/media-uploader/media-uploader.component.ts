import { Component, input, output, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="className()">
      <div
        class="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors"
        [class.border-primary]="isDragOver()"
        [class.bg-primary-light]="isDragOver()"
        [class.border-border]="!isDragOver()"
        [class.hover:border-muted]="!isDragOver()"
        [class.pointer-events-none]="isUploading()"
        [class.opacity-60]="isUploading()"
        (drop)="handleDrop($event)"
        (dragover)="handleDragOver($event)"
        (dragleave)="handleDragLeave()"
        (click)="fileInput.click()"
        role="button"
        tabindex="0"
        (keydown)="handleKeyDown($event)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mb-2 h-8 w-8 text-muted"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p class="text-sm text-muted">{{ label() }}</p>
        @if (accept()) {
          <p class="mt-1 text-xs text-muted/70">Tipos aceptados: {{ accept() }}</p>
        }

        <input
          #fileInput
          type="file"
          [attr.accept]="accept()"
          (change)="handleInputChange($event)"
          class="hidden"
        />
      </div>

      @if (isUploading()) {
        <div class="mt-2">
          <div class="flex items-center justify-between text-xs text-muted">
            <span>Subiendo...</span>
            <span>{{ progress() }}%</span>
          </div>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-primary-light">
            <div
              class="h-full rounded-full bg-primary transition-all duration-300"
              [style.width.%]="progress()"
            ></div>
          </div>
        </div>
      }

      @if (error()) {
        <p class="mt-2 text-sm text-error">{{ error() }}</p>
      }
    </div>
  `,
})
export class MediaUploaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly accept = input<string>('');
  readonly maxSize = input<number>(0);
  readonly progress = input<number>(0);
  readonly isUploading = input<boolean>(false);
  readonly onFileSelect = output<File>();
  readonly label = input<string>('Arrastra un archivo aqui o haz clic para seleccionar');
  readonly className = input<string>('');

  isDragOver = signal(false);
  error = signal<string | null>(null);

  handleFile(file: File): void {
    this.error.set(null);

    const maxSizeVal = this.maxSize();
    if (maxSizeVal && file.size > maxSizeVal) {
      const maxMB = (maxSizeVal / (1024 * 1024)).toFixed(1);
      this.error.set(`El archivo excede el tamano maximo de ${maxMB} MB`);
      return;
    }

    this.onFileSelect.emit(file);
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  handleDragLeave(): void {
    this.isDragOver.set(false);
  }

  handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) this.handleFile(file);
    // Reset input so same file can be re-selected
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.fileInput?.nativeElement.click();
    }
  }
}
