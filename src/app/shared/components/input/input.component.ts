import { Component, input, output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

type InputSize = 'sm' | 'md' | 'lg';
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="inputId()" class="block text-sm font-medium text-dark mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <div class="relative">
        @if (icon()) {
          <span
            class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted"
          >
            {{ icon() }}
          </span>
        }

        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [ngClass]="inputClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="w-full bg-surface border border-border rounded-lg text-dark placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />

        @if (suffixIcon()) {
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted"
          >
            {{ suffixIcon() }}
          </span>
        }
      </div>

      @if (hint() && !error()) {
        <p class="mt-1.5 text-xs text-muted">{{ hint() }}</p>
      }

      @if (error()) {
        <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">error</span>
          {{ error() }}
        </p>
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
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly icon = input<string>();
  readonly suffixIcon = input<string>();
  readonly size = input<InputSize>('md');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly fullWidth = input<boolean>(true);

  readonly value = signal<string>('');
  private readonly uniqueId = `input-${Math.random().toString(36).slice(2, 9)}`;

  inputId(): string {
    return this.uniqueId;
  }

  // ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled by input signal
  }

  inputClasses(): Record<string, boolean> {
    const size = this.size();
    const hasIcon = !!this.icon();
    const hasSuffixIcon = !!this.suffixIcon();

    const sizes: Record<InputSize, Record<string, boolean>> = {
      sm: {
        'px-3 py-1.5 text-sm': true,
      },
      md: {
        'px-4 py-2.5 text-sm': true,
      },
      lg: {
        'px-4 py-3 text-base': true,
      },
    };

    return {
      ...sizes[size],
      'pl-10': hasIcon,
      'pr-10': hasSuffixIcon,
      'border-red-500 focus:border-red-500 focus:ring-red-500/50': !!this.error(),
    };
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
