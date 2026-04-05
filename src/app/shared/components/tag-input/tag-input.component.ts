import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border border-border px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
    >
      @for (tag of tags(); track $index) {
        <span
          class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
        >
          {{ tag }}
          <button
            type="button"
            (click)="removeTag($index)"
            class="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-primary hover:bg-primary/20"
            aria-label="Eliminar etiqueta"
          >
            <span class="material-symbols-outlined text-xs">close</span>
          </button>
        </span>
      }
      <input
        type="text"
        [(ngModel)]="inputValue"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur()"
        [placeholder]="tags().length === 0 ? placeholder() : ''"
        class="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted/60"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TagInputComponent {
  readonly tags = input<string[]>([]);
  readonly placeholder = input<string>('Agregar etiqueta...');
  readonly maxTags = input<number>(Infinity);

  readonly tagsChange = output<string[]>();

  inputValue = '';

  addTag(value: string): void {
    const trimmed = value.trim();
    if (trimmed && !this.tags().includes(trimmed) && this.tags().length < this.maxTags()) {
      this.tagsChange.emit([...this.tags(), trimmed]);
    }
    this.inputValue = '';
  }

  removeTag(index: number): void {
    this.tagsChange.emit(this.tags().filter((_, i) => i !== index));
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag(this.inputValue);
    } else if (event.key === 'Backspace' && !this.inputValue && this.tags().length > 0) {
      this.removeTag(this.tags().length - 1);
    }
  }

  onBlur(): void {
    if (this.inputValue.trim()) {
      this.addTag(this.inputValue);
    }
  }
}
