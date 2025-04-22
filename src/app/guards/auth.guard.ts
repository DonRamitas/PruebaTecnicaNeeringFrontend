// Se encarga de proteger ciertas rutas a las que solo se puede acceder logeado
// Retorna un bool segun la validez del token
// Si es inválido también devuelve a /login y borra el JWT actual

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { isTokenValid } from './auth.utils';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');

  // Detecta si el token JWT existe y si este no ha expirado
  if (token && isTokenValid(token)) {
    return true;
  } else {
    localStorage.removeItem('jwt');
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};
