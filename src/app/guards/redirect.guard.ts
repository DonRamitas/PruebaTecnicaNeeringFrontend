// Se encarga de redirigir a la pantalla principal o al login cuando se llega a una ruta inválida
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

  return false;
};