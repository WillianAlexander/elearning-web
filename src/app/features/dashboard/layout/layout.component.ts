import { Component, signal, inject, afterNextRender } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-bg overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar [isOpen]="sidebarOpen()" (closed)="sidebarOpen.set(false)"></app-sidebar>

      <!-- Main content -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <app-header (menuToggled)="toggleSidebar()"></app-header>
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class LayoutComponent {
  readonly sidebarOpen = signal(false);
  private readonly router = inject(Router);

  constructor() {
    afterNextRender(() => {
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        const main = document.querySelector('main');
        if (main) {
          main.scrollTo(0, 0);
        }
      });
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
