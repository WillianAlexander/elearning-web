import { Component, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt()"
        [ngClass]="sizeClasses()"
        class="rounded-full object-cover bg-surface"
      />
    } @else {
      <div
        [ngClass]="[sizeClasses(), bgColor()]"
        class="rounded-full flex items-center justify-center text-white font-medium"
      >
        @if (loading()) {
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
        } @else {
          {{ initials() }}
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class AvatarComponent {
  readonly src = input<string>();
  readonly alt = input<string>('');
  readonly name = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly loading = input<boolean>(false);

  readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  readonly bgColor = computed(() => {
    const name = this.name();
    if (!name) return 'bg-gray-400';
    // Generate consistent color from name
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

  sizeClasses(): Record<string, boolean> {
    const size = this.size();
    const sizes: Record<AvatarSize, Record<string, boolean>> = {
      xs: { 'w-6 h-6 text-xs': true },
      sm: { 'w-8 h-8 text-sm': true },
      md: { 'w-10 h-10 text-base': true },
      lg: { 'w-12 h-12 text-lg': true },
      xl: { 'w-16 h-16 text-xl': true },
    };
    return sizes[size];
  }
}
