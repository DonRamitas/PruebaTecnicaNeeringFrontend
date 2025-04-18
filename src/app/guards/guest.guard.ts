// src/app/guards/guest.guard.ts
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