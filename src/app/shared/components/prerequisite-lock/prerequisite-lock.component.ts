import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prerequisite-lock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
      role="alert"
    >
      <span class="material-symbols-outlined text-xl text-muted shrink-0">lock</span>
      <div>
        <p class="text-sm font-medium text-dark">Módulo bloqueado</p>
        <p class="text-xs text-muted">
          Completa primero el módulo "{{ prerequisiteModuleTitle() }}" para desbloquear este
          contenido.
        </p>
      </div>
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
export class PrerequisiteLockComponent {
  readonly prerequisiteModuleTitle = input.required<string>();
}
