import { Component, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lesson-notes-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border border-border rounded-lg">
      <button
        type="button"
        (click)="isOpen.set(!isOpen())"
        class="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-dark hover:bg-primary/5 rounded-lg"
        [attr.aria-expanded]="isOpen()"
      >
        <span class="flex items-center gap-2">
          <span class="material-symbols-outlined text-lg" [class.text-primary]="hasNote()"
            >edit_note</span
          >
          Mis notas
          @if (saving()) {
            <span class="text-xs text-muted">Guardando...</span>
          }
        </span>
        <span class="material-symbols-outlined text-xl text-muted">
          {{ isOpen() ? 'expand_less' : 'expand_more' }}
        </span>
      </button>

      @if (isOpen()) {
        <div class="px-4 pb-4">
          <textarea
            [(ngModel)]="noteContent"
            (ngModelChange)="onContentChange($event)"
            placeholder="Escribe tus notas personales sobre esta lección..."
            class="w-full min-h-[120px] p-3 text-sm border border-border rounded-md bg-surface text-dark placeholder:text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-muted">
              {{ hasLocalChanges() ? 'Cambios sin guardar' : 'Guardado automáticamente' }}
            </span>
            @if (hasNote()) {
              <button
                type="button"
                (click)="onDelete()"
                class="text-xs text-red-600 hover:text-red-700"
              >
                Eliminar nota
              </button>
            }
          </div>
        </div>
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
export class LessonNotesPanelComponent implements OnInit, OnDestroy {
  readonly lessonId = input.required<string>();
  readonly initialContent = input<string>('');

  readonly noteSaved = output<string>();
  readonly noteDeleted = output<void>();

  noteContent = '';
  isOpen = signal(false);
  saving = signal(false);
  hasLocalChanges = signal(false);

  private contentChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.noteContent = this.initialContent();

    this.contentChanged.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe((content) => {
      this.saveNote(content);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasNote(): boolean {
    return !!this.initialContent() || this.noteContent.trim().length > 0;
  }

  onContentChange(content: string): void {
    this.noteContent = content;
    this.hasLocalChanges.set(true);
    this.contentChanged.next(content);
  }

  private saveNote(content: string): void {
    this.saving.set(true);
    this.noteSaved.emit(content);
    setTimeout(() => {
      this.saving.set(false);
      this.hasLocalChanges.set(false);
    }, 300);
  }

  onDelete(): void {
    this.noteContent = '';
    this.hasLocalChanges.set(false);
    this.noteDeleted.emit();
  }
}
