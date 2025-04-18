// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isTokenValid } from './auth.utils';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');

  if (token && isTokenValid(token)) {
    return true;
  } else {
    localStorage.removeItem('jwt'); // Limpia token inválido por seguridad
    router.navigate(['/login']);
    return false;
  }
};
