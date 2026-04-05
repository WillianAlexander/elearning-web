import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { EditorToolbarComponent } from '../editor-toolbar/editor-toolbar.component';
import { TiptapEditorComponent } from '../tiptap-editor/tiptap-editor.component';
import { VideoBlockComponent } from '../video-block/video-block.component';
import { PdfBlockComponent } from '../pdf-block/pdf-block.component';
import { ImageBlockComponent } from '../image-block/image-block.component';
import { QuizBlockComponent } from '../quiz-block/quiz-block.component';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { EmbedBlockComponent } from '../embed-block/embed-block.component';
import { AudioBlockComponent } from '../audio-block/audio-block.component';

export interface ContentBlock {
  id: string;
  lessonId: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
}

@Component({
  selector: 'app-lesson-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    EditorToolbarComponent,
    TiptapEditorComponent,
    VideoBlockComponent,
    PdfBlockComponent,
    ImageBlockComponent,
    QuizBlockComponent,
    CodeBlockComponent,
    EmbedBlockComponent,
    AudioBlockComponent,
  ],
  template: `
    <div class="flex h-full flex-col">
      <!-- Lesson title -->
      <div class="border-b border-border px-6 py-3">
        <input
          type="text"
          [value]="lesson().title"
          (input)="onTitleChange($event)"
          (blur)="onTitleBlur()"
          (keydown.enter)="onTitleEnter($event)"
          class="w-full border-none bg-transparent text-lg font-semibold text-dark outline-none placeholder:text-muted/60"
          placeholder="Título de la lección"
        />
      </div>

      <!-- Toolbar -->
      <div class="px-6 py-2">
        <app-editor-toolbar (blockTypeSelected)="addBlock($event)" />
      </div>

      <!-- Content blocks -->
      <div
        class="flex-1 space-y-4 overflow-y-auto px-6 py-4"
        cdkDropList
        (cdkDropListDropped)="onBlockDrop($event)"
      >
        @if (blocks().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <p class="text-sm text-muted">
              Esta lección está vacía. Usa la barra de herramientas para agregar bloques de
              contenido.
            </p>
          </div>
        }

        @for (block of blocks(); track block.id; let index = $index) {
          <div class="group relative flex gap-1" cdkDrag>
            <!-- Reorder + delete controls -->
            <div
              class="flex flex-col items-center gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <button
                type="button"
                (click)="moveBlock(index, 'up')"
                [disabled]="index === 0"
                class="rounded p-0.5 text-muted/60 hover:bg-gray-100 hover:text-muted disabled:invisible"
                aria-label="Mover arriba"
              >
                <span class="material-symbols-outlined text-base">arrow_upward</span>
              </button>
              <button
                type="button"
                (click)="moveBlock(index, 'down')"
                [disabled]="index === blocks().length - 1"
                class="rounded p-0.5 text-muted/60 hover:bg-gray-100 hover:text-muted disabled:invisible"
                aria-label="Mover abajo"
              >
                <span class="material-symbols-outlined text-base">arrow_downward</span>
              </button>
              <button
                type="button"
                (click)="deleteBlock(block.id)"
                class="mt-1 rounded p-0.5 text-muted/60 hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar bloque"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            <!-- Drag handle -->
            <div class="pt-2 pr-1 cursor-grab text-muted/40 hover:text-muted">
              <span class="material-symbols-outlined text-lg">drag_indicator</span>
            </div>

            <!-- Block renderer -->
            <div class="min-w-0 flex-1">
              @switch (block.type) {
                @case ('text') {
                  <app-tiptap-editor
                    [content]="getBlockContent(block, 'html')"
                    (contentChange)="updateBlockContent(block.id, { html: $event })"
                  />
                }
                @case ('video') {
                  <app-video-block
                    [content]="getVideoContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('pdf') {
                  <app-pdf-block
                    [content]="getPdfContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('image') {
                  <app-image-block
                    [content]="getImageContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('quiz') {
                  <app-quiz-block
                    [content]="getQuizContent(block)"
                    [editMode]="true"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('code') {
                  <app-code-block
                    [content]="getCodeContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('embed') {
                  <app-embed-block
                    [content]="getEmbedContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @case ('audio') {
                  <app-audio-block
                    [content]="getAudioContent(block)"
                    (contentUpdate)="updateBlockContent(block.id, $event)"
                  />
                }
                @default {
                  <div class="rounded-md border border-border p-4 text-sm text-muted">
                    Tipo de bloque no soportado: {{ block.type }}
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class LessonEditorComponent {
  readonly lesson = input.required<Lesson>();
  readonly courseId = input.required<string>();

  readonly blocks = input.required<ContentBlock[]>();
  readonly blockAdded = output<ContentBlock>();
  readonly blockUpdated = output<{ id: string; content: Record<string, unknown> }>();
  readonly blockDeleted = output<string>();
  readonly blocksReordered = output<string[]>();
  readonly titleChanged = output<string>();

  titleValue = signal('');

  ngOnInit(): void {
    this.titleValue.set(this.lesson().title);
  }

  getBlockContent(block: ContentBlock, key: string): string {
    return (block.content[key] as string) || '';
  }

  getVideoContent(block: ContentBlock): { mediaId?: string; url?: string } {
    return block.content as { mediaId?: string; url?: string };
  }

  getPdfContent(block: ContentBlock): { mediaId?: string; fileName?: string; url?: string } {
    return block.content as { mediaId?: string; fileName?: string; url?: string };
  }

  getImageContent(block: ContentBlock): { mediaId?: string; url?: string; alt?: string } {
    return block.content as { mediaId?: string; url?: string; alt?: string };
  }

  getQuizContent(block: ContentBlock): {
    questions: any[];
    maxAttempts?: number;
    passingScore?: number;
  } {
    return block.content as { questions: any[]; maxAttempts?: number; passingScore?: number };
  }

  getCodeContent(block: ContentBlock): { code: string; language: string } {
    return block.content as { code: string; language: string };
  }

  getEmbedContent(block: ContentBlock): { url?: string; title?: string } {
    return block.content as { url?: string; title?: string };
  }

  getAudioContent(block: ContentBlock): {
    mediaId?: string | null;
    url?: string | null;
    title?: string;
  } {
    return block.content as { mediaId?: string | null; url?: string | null; title?: string };
  }

  onTitleChange(event: Event): void {
    this.titleValue.set((event.target as HTMLInputElement).value);
  }

  onTitleBlur(): void {
    const trimmed = this.titleValue().trim();
    if (trimmed && trimmed !== this.lesson().title) {
      this.titleChanged.emit(trimmed);
    }
  }

  onTitleEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
  }

  addBlock(type: string): void {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substring(2, 9),
      lessonId: this.lesson().id,
      type,
      content: this.getDefaultContent(type),
      order: this.blocks().length,
    };
    this.blockAdded.emit(newBlock);
  }

  private getDefaultContent(type: string): Record<string, unknown> {
    switch (type) {
      case 'text':
        return { html: '<p></p>' };
      case 'video':
        return { mediaId: null, url: null };
      case 'pdf':
        return { mediaId: null, fileName: null, url: null };
      case 'image':
        return { mediaId: null, url: null, alt: '' };
      case 'quiz':
        return { questions: [] };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'embed':
        return { url: '', title: '' };
      case 'audio':
        return { mediaId: null, url: null, title: '' };
      default:
        return {};
    }
  }

  updateBlockContent(id: string, content: Record<string, unknown>): void {
    this.blockUpdated.emit({ id, content });
  }

  deleteBlock(id: string): void {
    this.blockDeleted.emit(id);
  }

  moveBlock(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.blocks().length) return;

    const blocksCopy = [...this.blocks()];
    const [moved] = blocksCopy.splice(index, 1);
    blocksCopy.splice(newIndex, 0, moved!);

    this.blocksReordered.emit(blocksCopy.map((b) => b.id));
  }

  onBlockDrop(event: CdkDragDrop<ContentBlock[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const blocksCopy = [...this.blocks()];
      moveItemInArray(blocksCopy, event.previousIndex, event.currentIndex);
      this.blocksReordered.emit(blocksCopy.map((b) => b.id));
    }
  }
}
