import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (authStore.isAuthenticated()) {
      <header class="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            type="button"
            (click)="menuToggled.emit()"
            class="rounded-md p-2 text-muted hover:text-dark lg:hidden"
            aria-label="Abrir menu"
          >
            <app-icon name="menu" [size]="24"></app-icon>
          </button>
          <h1 class="text-lg font-semibold text-dark lg:hidden">Aula Virtual</h1>
        </div>

        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <button
            type="button"
            class="relative rounded-full p-2 text-muted hover:bg-bg hover:text-dark transition-colors"
            aria-label="Notificaciones"
          >
            <app-icon name="notifications" [size]="20"></app-icon>
          </button>

          <!-- User avatar + logout -->
          <div class="flex items-center gap-3 pl-3 border-l border-border">
            <div
              class="size-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-semibold"
            >
              {{ initials() }}
            </div>
            <span class="hidden text-sm font-medium text-dark sm:block">
              {{ authStore.userFullName() }}
            </span>
            <button
              type="button"
              (click)="logout()"
              class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-dark transition-colors"
              aria-label="Cerrar sesion"
            >
              <app-icon name="logout" [size]="20"></app-icon>
            </button>
          </div>
        </div>
      </header>
    }
  `,
})
export class HeaderComponent {
  readonly menuToggled = output<void>();

  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly initials = computed(() => {
    const name = this.authStore.userFullName();
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();
  });

  logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/auth']);
  }
}
