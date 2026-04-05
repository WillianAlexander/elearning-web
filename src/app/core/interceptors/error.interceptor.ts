import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authStore.logout();
        void router.navigate(['/auth']);
      }
      return throwError(() => error);
    }),
  );
};
