import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CoursesService, CourseFilters } from '../../../core/services/courses.service';
import { EnrollmentsService, EnrollmentFilters } from '../../../core/services/enrollments.service';
import { Course, Enrollment } from '../../../core/types/models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatsCardsComponent } from '../../../shared/components/stats-cards/stats-cards.component';
import { ReportTableComponent } from '../../../shared/components/report-table/report-table.component';

type TabKey = 'by-course' | 'by-user';

interface CourseReport {
  courseId: string;
  courseTitle: string;
  enrolled: number;
  completed: number;
  avgProgress: number;
}

interface UserReport {
  userId: string;
  userName: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  avgProgress: number;
  lastAccess: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, IconComponent, StatsCardsComponent, ReportTableComponent],
  template: `
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
          <app-icon name="bar_chart" [size]="24" className="text-primary"></app-icon>
        </div>
        <div>
          <h1 class="font-heading text-2xl font-bold text-dark">Reportes</h1>
          <p class="text-sm text-muted">Métricas y estadísticas de la plataforma</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-6">
        <app-stats-cards
          [stats]="[
            {
              label: 'Cursos Publicados',
              value: totalPublished(),
              icon: 'school',
              color: 'primary',
            },
            {
              label: 'Total Inscripciones',
              value: totalEnrollments(),
              icon: 'group',
              color: 'dark',
            },
            {
              label: 'Tasa de Completitud',
              value: completionRate() + '%',
              icon: 'check_circle',
              color: 'accent',
            },
            {
              label: 'Progreso Promedio',
              value: avgProgress() + '%',
              icon: 'trending_up',
              color: 'primary',
            },
          ]"
        ></app-stats-cards>
      </div>

      <!-- Tabs -->
      <div class="mt-8">
        <div class="flex gap-1 rounded-xl bg-bg p-1">
          <button
            type="button"
            (click)="activeTab.set('by-course')"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
            [class.bg-surface]="activeTab() === 'by-course'"
            [class.text-dark]="activeTab() === 'by-course'"
            [class.shadow-subtle]="activeTab() === 'by-course'"
            [class.text-muted]="activeTab() !== 'by-course'"
            [class.hover:text-dark]="activeTab() !== 'by-course'"
          >
            <app-icon
              name="school"
              [size]="16"
              [className]="activeTab() === 'by-course' ? 'text-primary' : ''"
            ></app-icon>
            Por Curso
          </button>
          <button
            type="button"
            (click)="activeTab.set('by-user')"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
            [class.bg-surface]="activeTab() === 'by-user'"
            [class.text-dark]="activeTab() === 'by-user'"
            [class.shadow-subtle]="activeTab() === 'by-user'"
            [class.text-muted]="activeTab() !== 'by-user'"
            [class.hover:text-dark]="activeTab() !== 'by-user'"
          >
            <app-icon
              name="group"
              [size]="16"
              [className]="activeTab() === 'by-user' ? 'text-primary' : ''"
            ></app-icon>
            Por Usuario
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="mt-6">
        @if (loading()) {
          <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 shadow-subtle"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-muted border-t-primary"
            ></div>
            <p class="text-sm text-muted">Cargando reportes...</p>
          </div>
        } @else if (activeTab() === 'by-course') {
          <app-report-table
            title="Progreso por Curso"
            icon="school"
            [data]="courseReports()"
            keyField="courseId"
            emptyMessage="No hay inscripciones en cursos publicados."
            [columns]="courseColumns()"
          ></app-report-table>
        } @else {
          <app-report-table
            title="Progreso por Usuario"
            icon="group"
            [data]="userReports()"
            keyField="userId"
            emptyMessage="No hay usuarios con inscripciones."
            [columns]="userColumns()"
          ></app-report-table>
        }
      </div>
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private enrollmentsService = inject(EnrollmentsService);

  courses = signal<Course[]>([]);
  enrollments = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<TabKey>('by-course');

  totalPublished = computed(() => this.courses().length);
  totalEnrollments = computed(() => this.enrollments().length);

  completionRate = computed(() => {
    const total = this.enrollments().length;
    if (total === 0) return 0;
    const completed = this.enrollments().filter((e) => e.status === 'completed').length;
    return Math.round((completed / total) * 100);
  });

  avgProgress = computed(() => {
    const arr = this.enrollments();
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / arr.length);
  });

  courseReports = computed(() => {
    const enrollments = this.enrollments();
    const map = new Map<
      string,
      { title: string; enrolled: number; completed: number; totalProgress: number }
    >();

    for (const e of enrollments) {
      if (!e.course) continue;
      const existing = map.get(e.courseId);
      if (existing) {
        existing.enrolled += 1;
        if (e.status === 'completed') existing.completed += 1;
        existing.totalProgress += e.progressPercentage || 0;
      } else {
        map.set(e.courseId, {
          title: e.course?.title || '',
          enrolled: 1,
          completed: e.status === 'completed' ? 1 : 0,
          totalProgress: e.progressPercentage || 0,
        });
      }
    }

    return Array.from(map.entries())
      .map(([courseId, data]) => ({
        courseId,
        courseTitle: data.title,
        enrolled: data.enrolled,
        completed: data.completed,
        avgProgress: data.enrolled > 0 ? Math.round(data.totalProgress / data.enrolled) : 0,
      }))
      .sort((a, b) => b.enrolled - a.enrolled);
  });

  userReports = computed(() => {
    const enrollments = this.enrollments();
    const map = new Map<
      string,
      { enrolled: number; completed: number; totalProgress: number; lastAccess: string }
    >();

    for (const e of enrollments) {
      const access = e.lastAccessedAt || e.enrolledAt;
      const existing = map.get(e.userId);
      if (existing) {
        existing.enrolled += 1;
        if (e.status === 'completed') existing.completed += 1;
        existing.totalProgress += e.progressPercentage || 0;
        if (access > existing.lastAccess) existing.lastAccess = access;
      } else {
        map.set(e.userId, {
          enrolled: 1,
          completed: e.status === 'completed' ? 1 : 0,
          totalProgress: e.progressPercentage || 0,
          lastAccess: access,
        });
      }
    }

    return Array.from(map.entries())
      .map(([userId, data]) => ({
        userId,
        userName: userId.slice(0, 8),
        coursesEnrolled: data.enrolled,
        coursesCompleted: data.completed,
        avgProgress: data.enrolled > 0 ? Math.round(data.totalProgress / data.enrolled) : 0,
        lastAccess: new Date(data.lastAccess).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }))
      .sort((a, b) => b.coursesEnrolled - a.coursesEnrolled);
  });

  courseColumns = computed(() => [
    {
      header: 'Curso',
      accessor: (r: CourseReport) => r.courseTitle,
    },
    {
      header: 'Inscritos',
      align: 'center' as const,
      accessor: (r: CourseReport) => r.enrolled,
    },
    {
      header: 'Completados',
      align: 'center' as const,
      accessor: (r: CourseReport) => r.completed,
    },
    {
      header: 'Progreso',
      align: 'right' as const,
      accessor: (r: CourseReport) => r.avgProgress + '%',
    },
  ]);

  userColumns = computed(() => [
    {
      header: 'Usuario',
      accessor: (r: UserReport) => r.userName,
    },
    {
      header: 'Cursos',
      align: 'center' as const,
      accessor: (r: UserReport) => r.coursesEnrolled,
    },
    {
      header: 'Completados',
      align: 'center' as const,
      accessor: (r: UserReport) => r.coursesCompleted,
    },
    {
      header: 'Progreso',
      align: 'center' as const,
      accessor: (r: UserReport) => r.avgProgress + '%',
    },
    {
      header: 'Último Acceso',
      align: 'right' as const,
      accessor: (r: UserReport) => r.lastAccess,
    },
  ]);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      // Load published courses
      const coursesRes = await firstValueFrom(
        this.coursesService.getCourses({ status: 'published', pageSize: 100 } as CourseFilters),
      );
      this.courses.set(coursesRes.items);

      // Load enrollments
      const enrollRes = await firstValueFrom(
        this.enrollmentsService.getEnrollments({ pageSize: 100 } as EnrollmentFilters),
      );
      this.enrollments.set(enrollRes.items);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
