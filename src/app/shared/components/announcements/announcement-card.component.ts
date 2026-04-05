import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

interface Author {
  firstName: string;
  lastName: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author?: Author;
  publishedAt?: string;
}

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <article class="rounded-lg border border-outline/20 bg-surface p-4">
      <div class="flex items-start gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <app-icon name="campaign" [size]="20" class="text-primary"></app-icon>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-on-surface">
            {{ announcement().title }}
          </h3>
          <p class="mt-1 text-sm text-on-surface/80 whitespace-pre-wrap">
            {{ announcement().content }}
          </p>
          <div class="mt-2 flex items-center gap-2 text-xs text-muted">
            <span>
              {{
                announcement().author
                  ? announcement().author!.firstName + ' ' + announcement().author!.lastName
                  : 'Instructor'
              }}
            </span>
            <span aria-hidden="true">·</span>
            <time>
              {{
                announcement().publishedAt ? formatDate(announcement().publishedAt!) : 'Borrador'
              }}
            </time>
          </div>
        </div>
      </div>
    </article>
  `,
})
export class AnnouncementCardComponent {
  readonly announcement = input.required<Announcement>();

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
