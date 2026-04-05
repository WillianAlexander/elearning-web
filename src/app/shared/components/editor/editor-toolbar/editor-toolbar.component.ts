import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ContentBlockType =
  | 'text'
  | 'video'
  | 'pdf'
  | 'image'
  | 'quiz'
  | 'code'
  | 'embed'
  | 'audio';

interface BlockOption {
  type: ContentBlockType;
  label: string;
  icon: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'text',
    label: 'Texto',
    icon: 'M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L14.75 9.58V17.25a.75.75 0 01-1.5 0V9.58l-1.95 2.18a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z',
  },
  {
    type: 'video',
    label: 'Video',
    icon: 'M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z',
  },
  {
    type: 'pdf',
    label: 'PDF',
    icon: 'M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z',
  },
  {
    type: 'image',
    label: 'Imagen',
    icon: 'M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81V14.75c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.06l-2.47-2.47a.75.75 0 00-1.06 0l-3.97 3.97-2.22-2.22a.75.75 0 00-1.06 0L2.5 11.06zM10 4.5a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    type: 'quiz',
    label: 'Quiz',
    icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z',
  },
  {
    type: 'code',
    label: 'Codigo',
    icon: 'M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z',
  },
  {
    type: 'embed',
    label: 'Embed',
    icon: 'M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v11.5A2.25 2.25 0 0115.75 18H4.25A2.25 2.25 0 012 15.75V4.25zm6.22 3.47a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06L10.94 10 8.22 7.28a.75.75 0 010-1.06zm-2.44 0a.75.75 0 010 1.06L3.56 11l2.22 2.22a.75.75 0 11-1.06 1.06l-2.75-2.75a.75.75 0 010-1.06l2.75-2.75a.75.75 0 011.06 0zm9.44 0a.75.75 0 011.06 0l2.75 2.75a.75.75 0 010 1.06l-2.75 2.75a.75.75 0 11-1.06-1.06L17.44 11l-2.22-2.22a.75.75 0 010-1.06z',
  },
  {
    type: 'audio',
    label: 'Audio',
    icon: 'M15.5 2.1a.75.75 0 00-.96-.44l-9 3A.75.75 0 005 5.37v8.49a2.501 2.501 0 101.5 2.28V8.87l7.5-2.5v5.39a2.501 2.501 0 101.5 2.28V2.75a.75.75 0 00-.5-.65z',
  },
];

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-wrap items-center gap-1 rounded-md border border-border bg-bg px-2 py-1.5"
    >
      <span class="mr-1 text-xs font-medium text-muted"> Agregar bloque: </span>
      @for (option of blockOptions; track option.type) {
        <button
          type="button"
          (click)="addBlock.emit(option.type)"
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-dark transition-colors hover:bg-surface hover:shadow-sm"
          [title]="option.label"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-4 w-4"
          >
            <path [attr.d]="option.icon" fill-rule="evenodd" clip-rule="evenodd" />
          </svg>
          <span class="hidden sm:inline">{{ option.label }}</span>
        </button>
      }
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
export class EditorToolbarComponent {
  readonly addBlock = output<ContentBlockType>();

  blockOptions = BLOCK_OPTIONS;
}
