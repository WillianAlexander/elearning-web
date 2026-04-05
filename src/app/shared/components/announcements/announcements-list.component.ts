import { Component, Input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AnnouncementCardComponent } from './announcement-card.component';

interface Author {
  id: string;
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
  selector: 'app-announcements-list',
  standalone: true,
  imports: [CommonModule, AnnouncementCardComponent],
  template: `
    @if (isLoading()) {
      <div class="space-y-3">
        @for (i of [1, 2]; track i) {
          <div class="animate-pulse rounded-lg bg-surface-variant p-4">
            <div class="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div class="h-3 w-full bg-gray-200 rounded"></div>
          </div>
        }
      </div>
    } @else if (!announcements() || announcements()!.length === 0) {
      <p class="text-sm text-muted py-4">No hay anuncios para este curso.</p>
    } @else {
      <div class="space-y-3">
        @for (announcement of announcements(); track announcement.id) {
          <app-announcement-card [announcement]="announcement"></app-announcement-card>
        }
      </div>
    }
  `,
})
export class AnnouncementsListComponent {
  @Input() courseId: string = '';

  announcements = signal<Announcement[] | null>(null);
  isLoading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  ngOnChanges(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading.set(true);
    this.http.get<Announcement[]>(`/api/v1/courses/${this.courseId}/announcements`).subscribe({
      next: (data) => {
        this.announcements.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.announcements.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
