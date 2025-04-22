// Impide que el usuario vuelva a la pantalla de login si ya está logeado
// Lo retorna a la pantalla principal, la de productos
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');
  if (token) {
    router.navigate(['/products']);
    return false;
  }
  return true;
};