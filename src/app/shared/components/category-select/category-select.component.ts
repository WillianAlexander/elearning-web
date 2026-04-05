import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CategorySelectComponent,
      multi: true,
    },
  ],
  template: `
    <select
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
    >
      <option value="">{{ placeholder() }}</option>
      @for (item of flatCategories; track item.id) {
        <option [value]="item.id">
          {{ getIndentation(item.level) }}{{ item.level > 0 ? '└ ' : '' }}{{ item.name }}
        </option>
      }
    </select>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CategorySelectComponent implements ControlValueAccessor {
  readonly categories = input.required<Category[]>();
  readonly placeholder = input<string>('Seleccionar categoria');

  value = '';
  flatCategories: Array<{ id: string; name: string; level: number }> = [];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.flatCategories = this.flattenCategories(this.categories());
  }

  flattenCategories(
    categories: Category[],
    level = 0,
  ): Array<{ id: string; name: string; level: number }> {
    const result: Array<{ id: string; name: string; level: number }> = [];
    for (const cat of categories) {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children?.length) {
        result.push(...this.flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  }

  getIndentation(level: number): string {
    return '  '.repeat(level);
  }

  onValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
