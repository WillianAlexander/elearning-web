import { Component, input, output, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TiptapEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="tiptap-editor">
      @if (editable()) {
        <div
          class="mb-1 flex flex-wrap gap-0.5 rounded-t-md border border-b-0 border-border bg-gray-50 px-2 py-1"
        >
          <button
            type="button"
            (click)="toggleFormat('bold')"
            class="rounded px-2 py-0.5 text-xs font-medium"
            [class.bg-primary/10]="isActive('bold')"
            [class.text-dark]="isActive('bold')"
            [class.text-muted]="!isActive('bold')"
            [class.hover:bg-gray-100]="!isActive('bold')"
          >
            B
          </button>
          <button
            type="button"
            (click)="toggleFormat('italic')"
            class="rounded px-2 py-0.5 text-xs italic"
            [class.bg-primary/10]="isActive('italic')"
            [class.text-dark]="isActive('italic')"
            [class.text-muted]="!isActive('italic')"
            [class.hover:bg-gray-100]="!isActive('italic')"
          >
            I
          </button>
          <div class="mx-1 w-px bg-border"></div>
          <button
            type="button"
            (click)="toggleFormat('strike')"
            class="rounded px-2 py-0.5 text-xs line-through"
            [class.bg-primary/10]="isActive('strike')"
            [class.text-dark]="isActive('strike')"
            [class.text-muted]="!isActive('strike')"
            [class.hover:bg-gray-100]="!isActive('strike')"
          >
            S
          </button>
          <div class="mx-1 w-px bg-border"></div>
          <button
            type="button"
            (click)="toggleFormat('ordered')"
            class="rounded px-2 py-0.5 text-xs"
            [class.bg-primary/10]="isActive('ordered')"
            [class.text-dark]="isActive('ordered')"
            [class.text-muted]="!isActive('ordered')"
            [class.hover:bg-gray-100]="!isActive('ordered')"
          >
            1.
          </button>
          <button
            type="button"
            (click)="toggleFormat('bullet')"
            class="rounded px-2 py-0.5 text-xs"
            [class.bg-primary/10]="isActive('bullet')"
            [class.text-dark]="isActive('bullet')"
            [class.text-muted]="!isActive('bullet')"
            [class.hover:bg-gray-100]="!isActive('bullet')"
          >
            •
          </button>
          <div class="mx-1 w-px bg-border"></div>
          <button
            type="button"
            (click)="toggleFormat('link')"
            class="rounded px-2 py-0.5 text-xs"
            [class.bg-primary/10]="isActive('link')"
            [class.text-dark]="isActive('link')"
            [class.text-muted]="!isActive('link')"
            [class.hover:bg-gray-100]="!isActive('link')"
          >
            🔗
          </button>
          <button
            type="button"
            (click)="toggleFormat('blockquote')"
            class="rounded px-2 py-0.5 text-xs"
            [class.bg-primary/10]="isActive('blockquote')"
            [class.text-dark]="isActive('blockquote')"
            [class.text-muted]="!isActive('blockquote')"
            [class.hover:bg-gray-100]="!isActive('blockquote')"
          >
            "
          </button>
          <button
            type="button"
            (click)="toggleFormat('code-block')"
            class="rounded px-2 py-0.5 text-xs"
            [class.bg-primary/10]="isActive('code-block')"
            [class.text-dark]="isActive('code-block')"
            [class.text-muted]="!isActive('code-block')"
            [class.hover:bg-gray-100]="!isActive('code-block')"
          >
            &lt;/&gt;
          </button>
        </div>
      }

      <quill-editor
        [modules]="quillModules"
        [content]="content()"
        [readOnly]="!editable()"
        (onContentChanged)="onEditorChange($event)"
        [styles]="editorStyles"
        placeholder="Escribe tu contenido aquí..."
      ></quill-editor>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      :host ::ng-deep .ql-container {
        min-height: 120px;
      }
      :host ::ng-deep .ql-toolbar {
        border-color: #e5e7eb !important;
      }
      :host ::ng-deep .ql-container {
        border-color: #e5e7eb !important;
      }
    `,
  ],
})
export class TiptapEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  readonly content = input<string>('');
  readonly editable = input<boolean>(true);

  readonly contentChange = output<string>();

  quillModules = {
    toolbar: false,
  };

  editorStyles = {
    'min-height': '120px',
    'border-radius': '0 0 0.375rem 0.375rem',
  };

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private activeFormats = new Set<string>();

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onEditorChange(event: { html?: string; text?: string }): void {
    const html = event.html || '';
    this.contentChange.emit(html);
    this.onChange(html);
  }

  toggleFormat(format: string): void {
    if (this.activeFormats.has(format)) {
      this.activeFormats.delete(format);
    } else {
      this.activeFormats.add(format);
    }
  }

  isActive(format: string): boolean {
    return this.activeFormats.has(format);
  }

  writeValue(value: string): void {
    // Handled by input binding
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
