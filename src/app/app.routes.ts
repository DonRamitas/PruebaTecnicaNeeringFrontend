import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa el guard
import { redirectGuard } from './guards/redirect.guard'; // importa tu guard
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [redirectGuard], // <-- redirección condicional
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) // no se carga nunca gracias al guard
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
    canActivate: [AuthGuard]  // Protege la ruta con el guard
  },
  {
    path: '**',
    redirectTo: '',
  }
];
