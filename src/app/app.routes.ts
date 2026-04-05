import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, instructorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth routes (only for non-authenticated users)
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // Dashboard routes (authenticated)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      // Home
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/home/home.component').then((m) => m.HomeComponent),
      },

      // Collaborator — Catalog
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/dashboard/collaborator/courses/courses-list/courses-list.component').then(
            (m) => m.CoursesListComponent,
          ),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('./features/dashboard/collaborator/courses/course-detail/course-detail.component').then(
            (m) => m.CourseDetailComponent,
          ),
      },
      {
        path: 'courses/:id/lessons/:lessonId',
        loadComponent: () =>
          import('./features/dashboard/collaborator/courses/lesson-viewer/lesson-viewer.component').then(
            (m) => m.LessonViewerComponent,
          ),
      },

      // Collaborator — Progress
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./features/dashboard/collaborator/enrollments/enrollments.component').then(
            (m) => m.EnrollmentsComponent,
          ),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/dashboard/collaborator/progress/progress.component').then(
            (m) => m.ProgressComponent,
          ),
      },

      // Instructor routes
      {
        path: 'instructor/courses',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/courses/courses-list/instructor-courses.component').then(
            (m) => m.InstructorCoursesComponent,
          ),
      },
      {
        path: 'instructor/courses/new',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/courses/course-form/course-form.component').then(
            (m) => m.CourseFormComponent,
          ),
      },
      {
        path: 'instructor/courses/:id/edit',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/courses/course-editor/course-editor.component').then(
            (m) => m.CourseEditorComponent,
          ),
      },
      {
        path: 'instructor/courses/:id/preview',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/courses/course-preview/course-preview.component').then(
            (m) => m.CoursePreviewComponent,
          ),
      },
      {
        path: 'instructor/courses/:id/settings',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/courses/course-settings/course-settings.component').then(
            (m) => m.CourseSettingsComponent,
          ),
      },
      {
        path: 'instructor/categories',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/instructor/categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },

      // Admin routes
      {
        path: 'admin/courses',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/admin/courses/admin-courses.component').then(
            (m) => m.AdminCoursesComponent,
          ),
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/admin/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'admin/settings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/admin/settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },

      // Reports (admin + instructor)
      {
        path: 'reports',
        canActivate: [instructorGuard],
        loadComponent: () =>
          import('./features/dashboard/reports/reports.component').then((m) => m.ReportsComponent),
      },

      // Fallback dentro del dashboard
      { path: '**', redirectTo: '' },
    ],
  },

  // Fallback global
  { path: '**', redirectTo: '/dashboard' },
];
