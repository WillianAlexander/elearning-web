import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export const ICON_SIZE = {
  XS: 14,
  SM: 16,
  MS: 18,
  MD: 20,
  LG: 24,
  XL: 32,
} as const;

export type IconSize = (typeof ICON_SIZE)[keyof typeof ICON_SIZE];

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span
    [class]="'material-symbols-outlined select-none leading-none ' + className"
    [style.font-size.px]="size"
    [style.font-variation-settings]="filled ? '\\'FILL\\' 1' : '\\'FILL\\' 0'"
    aria-hidden="true"
    >{{ name }}</span
  >`,
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: IconSize = ICON_SIZE.MD;
  @Input() filled: boolean = false;
  @Input() className: string = '';
}
