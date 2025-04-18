// src/app/guards/redirect.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isTokenValid } from './auth.utils';

export const redirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');

  if (token && isTokenValid(token)) {
    router.navigate(['/products']);
  } else {
    router.navigate(['/login']);
  }

  // Importante: devolvemos false porque no queremos activar ninguna ruta, solo redirigir
  return false;
};