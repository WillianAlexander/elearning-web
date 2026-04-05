import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

const PUBLIC_PATTERNS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/register',
  '/auth/azure',
  '/health',
  '/public/',
];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_PATTERNS.some((pattern) => url.includes(pattern));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  // Skip auth header for public endpoints
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  // Add auth token to request
  const token = authStore.token();
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
