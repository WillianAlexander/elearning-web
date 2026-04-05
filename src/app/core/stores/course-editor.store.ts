import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CourseEditorStore {
  private readonly _course = signal<any>(null);
  private readonly _modules = signal<any[]>([]);
  private readonly _selectedLessonId = signal<string | null>(null);
  private readonly _blocks = signal<any[]>([]);
  private readonly _isDirty = signal(false);

  readonly course = this._course.asReadonly();
  readonly modules = this._modules.asReadonly();
  readonly selectedLessonId = this._selectedLessonId.asReadonly();
  readonly blocks = this._blocks.asReadonly();
  readonly isDirty = this._isDirty.asReadonly();

  readonly selectedLesson = computed(() => {
    const id = this._selectedLessonId();
    if (!id) return null;
    for (const mod of this._modules()) {
      const lesson = mod.lessons?.find((l: any) => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  });

  readonly canPublish = computed(
    () =>
      this._course()?.status === 'draft' &&
      this._modules().length > 0 &&
      this._modules().every((m: any) => (m.lessons?.length ?? 0) > 0),
  );

  setCourse(course: any) {
    this._course.set(course);
  }
  setModules(modules: any[]) {
    this._modules.set(modules);
  }
  selectLesson(id: string) {
    this._selectedLessonId.set(id);
  }
  setBlocks(blocks: any[]) {
    this._blocks.set(blocks);
  }
  addBlock(block: any) {
    this._blocks.update((b) => [...b, block]);
    this._isDirty.set(true);
  }
  updateBlock(id: string, content: Record<string, unknown>) {
    this._blocks.update((b) =>
      b.map((block: any) => (block.id === id ? { ...block, content } : block)),
    );
    this._isDirty.set(true);
  }
  removeBlock(id: string) {
    this._blocks.update((b) => b.filter((block: any) => block.id !== id));
    this._isDirty.set(true);
  }
  reorderBlocks(blocks: any[]) {
    this._blocks.set(blocks);
    this._isDirty.set(true);
  }
  markSaved() {
    this._isDirty.set(false);
  }
  markDirty() {
    this._isDirty.set(true);
  }
}
