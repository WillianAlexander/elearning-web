import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CodeBlockContent {
  code: string;
  language: string;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'sql',
  'html',
  'css',
  'json',
  'bash',
  'plaintext',
];

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overflow-hidden rounded-md border border-border">
      <!-- Header with language selector -->
      <div class="flex items-center justify-between bg-gray-800 px-3 py-1.5">
        <select
          [value]="language()"
          (change)="onLanguageChange($event)"
          class="rounded border-none bg-gray-700 px-2 py-0.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          @for (lang of languages; track lang) {
            <option [value]="lang">{{ lang }}</option>
          }
        </select>
        <span class="text-xs text-gray-400">Bloque de código</span>
      </div>

      <!-- Code editor -->
      <textarea
        [value]="code()"
        (input)="onCodeChange($event)"
        placeholder="// Escribe tu código aquí..."
        spellcheck="false"
        class="min-h-[150px] w-full resize-y border-none bg-gray-900 px-4 py-3 font-mono text-sm text-green-400 placeholder:text-gray-600 focus:outline-none"
      ></textarea>
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
export class CodeBlockComponent implements OnInit {
  readonly content = input.required<CodeBlockContent>();
  readonly editMode = input<boolean>(false);

  readonly contentUpdate = output<Record<string, unknown>>();

  languages = LANGUAGES;
  code = signal('');
  language = signal('javascript');

  ngOnInit(): void {
    this.code.set(this.content().code || '');
    this.language.set(this.content().language || 'javascript');
  }

  onCodeChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.code.set(value);
    this.contentUpdate.emit({ code: value, language: this.language() });
  }

  onLanguageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.language.set(value);
    this.contentUpdate.emit({ code: this.code(), language: value });
  }
}
