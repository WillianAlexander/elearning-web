import { inject } from '@angular/core';
import {
  Router,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthStore } from '../stores/auth.store';

/**
 * Guard that checks if user is authenticated
 */
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Check localStorage directly as fallback
  const token = localStorage.getItem('lms_token');
  if (token) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};

/**
 * Guard factory that checks if user has specific role(s)
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    // Check if user has any of the allowed roles
    if (authStore.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Fallback to localStorage (normalize role)
    const rawRole = localStorage.getItem('lms_user_role');
    const roleMap: Record<string, string> = {
      administrador: 'admin',
      instructor: 'instructor',
      colaborador: 'colaborador',
    };
    const userRole = rawRole ? (roleMap[rawRole.toLowerCase()] ?? rawRole) : null;
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to dashboard if user doesn't have required role
    router.navigate(['/dashboard']);
    return false;
  };
};

/**
 * Guard for admin-only routes
 */
export const adminGuard: CanActivateFn = roleGuard(['admin']);

/**
 * Guard for instructor routes (admin or instructor)
 */
export const instructorGuard: CanActivateFn = roleGuard(['admin', 'instructor']);

/**
 * Guard that redirects authenticated users away from auth pages
 */
export const guestGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Fallback to localStorage
  const token = localStorage.getItem('lms_token');
  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
