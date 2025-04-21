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
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage),
    canActivate: [AuthGuard]  // Protege la ruta con el guard
  },
  {
    path: 'product-add',
    loadComponent: () => import('./pages/product-add/product-add.page').then( m => m.ProductAddPage)
  },
  {
    path: 'product-detail/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then( m => m.ProductDetailPage)
  },
  {
    path: 'category-add',
    loadComponent: () => import('./pages/category-add/category-add.page').then( m => m.CategoryAddPage)
  },
  {
    path: 'product-edit/:id',
    loadComponent: () => import('./pages/product-edit/product-edit.page').then( m => m.ProductEditPage)
  },
  {
    path: 'category-add',
    loadComponent: () => import('./pages/category-add/category-add.page').then( m => m.CategoryAddPage)
  },
  {
    path: 'category-edit/:id',
    loadComponent: () => import('./pages/category-edit/category-edit.page').then( m => m.CategoryEditPage)
  },
  {
    path: '**',
    redirectTo: '',
  },
];
