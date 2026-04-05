import { Component, inject, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/stores/auth.store';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: string[]; // empty = all roles
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Inicio', href: '/dashboard', icon: 'home', roles: [] },
      { label: 'Catalogo', href: '/dashboard/courses', icon: 'grid_view', roles: [] },
      {
        label: 'Mi Progreso',
        href: '/dashboard/progress',
        icon: 'bar_chart',
        roles: ['colaborador'],
      },
      {
        label: 'Mis Inscripciones',
        href: '/dashboard/enrollments',
        icon: 'menu_book',
        roles: ['colaborador'],
      },
    ],
  },
  {
    title: 'Instructor',
    items: [
      {
        label: 'Mis Cursos',
        href: '/dashboard/instructor/courses',
        icon: 'school',
        roles: ['instructor'],
      },
      {
        label: 'Categorias',
        href: '/dashboard/instructor/categories',
        icon: 'category',
        roles: ['instructor', 'admin'],
      },
    ],
  },
  {
    title: 'Administracion',
    items: [
      {
        label: 'Cursos',
        href: '/dashboard/admin/courses',
        icon: 'school',
        roles: ['admin'],
      },
      {
        label: 'Usuarios',
        href: '/dashboard/admin/users',
        icon: 'group',
        roles: ['admin'],
      },
      {
        label: 'Reportes',
        href: '/dashboard/reports',
        icon: 'assessment',
        roles: ['admin', 'instructor'],
      },
      {
        label: 'Configuracion',
        href: '/dashboard/admin/settings',
        icon: 'settings',
        roles: ['admin'],
      },
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <!-- Mobile overlay -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        (click)="closed.emit()"
        role="button"
        tabindex="-1"
        aria-label="Cerrar menu"
      ></div>
    }

    <aside
      [class]="
        'fixed inset-y-0 left-0 z-50 w-[240px] shrink-0 bg-dark flex flex-col justify-between h-full transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ' +
        (isOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      "
    >
      <!-- Brand -->
      <div>
        <div class="h-16 flex items-center px-6 border-b border-white/10">
          <div class="flex items-center gap-3">
            <img
              src="/assets/brand/logo-icono.png"
              alt="Cooperativa"
              width="32"
              height="32"
              class="size-8 rounded"
            />
            <span class="text-white font-heading font-semibold tracking-tight text-sm"
              >Aula Virtual</span
            >
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-col gap-4 p-4 mt-2">
          @for (section of visibleSections(); track section.title ?? 'default') {
            <div>
              @if (section.title) {
                <p
                  class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-inactive"
                >
                  {{ section.title }}
                </p>
              }
              <div class="flex flex-col gap-1">
                @for (item of section.items; track item.href) {
                  <a
                    [routerLink]="item.href"
                    routerLinkActive="bg-primary text-white"
                    [routerLinkActiveOptions]="{ exact: item.href === '/dashboard' }"
                    (click)="closed.emit()"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-sidebar-inactive hover:bg-white/10 hover:text-white"
                    [class.bg-primary]="isActive(item.href)"
                    [class.text-white]="isActive(item.href)"
                  >
                    <app-icon [name]="item.icon" [size]="20"></app-icon>
                    <span>{{ item.label }}</span>
                  </a>
                }
              </div>
            </div>
          }
        </nav>
      </div>

      <!-- User info at bottom -->
      <div class="p-4 border-t border-white/10">
        @if (authStore.isAuthenticated()) {
          <div class="flex items-center gap-3 px-2 py-2">
            <div
              class="size-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-xs font-semibold"
            >
              {{ initials() }}
            </div>
            <div class="flex flex-col overflow-hidden flex-1">
              <p class="text-white text-sm font-medium truncate">
                {{ authStore.userFullName() }}
              </p>
              <p class="text-sidebar-inactive text-xs truncate">
                {{ authStore.user()?.cargo ?? authStore.userRole() }}
              </p>
            </div>
            <button
              (click)="logout()"
              class="text-sidebar-inactive hover:text-white transition-colors"
              title="Cerrar sesion"
            >
              <app-icon name="logout" [size]="18"></app-icon>
            </button>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class SidebarComponent {
  readonly isOpen = input<boolean>(false);
  readonly closed = output<void>();

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

  readonly visibleSections = computed(() => {
    const role = this.authStore.userRole() ?? '';
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.length === 0 || item.roles.includes(role)),
    })).filter((section) => section.items.length > 0);
  });

  isActive(href: string): boolean {
    const url = this.router.url;
    if (href === '/dashboard') return url === '/dashboard';
    return url === href || url.startsWith(href + '/');
  }

  logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/auth']);
  }
}
